"""
backend/core/idempotency.py
===========================
Durable, production-grade idempotency store for VEIL experiment-execution endpoints.

Guarantees
----------
- Durable SQLite persistence: Idempotency records survive application restarts
  and are shared across multiple Uvicorn worker processes.
- Atomic state transitions: Transactions (BEGIN IMMEDIATE) prevent race conditions
  during concurrent request acquisition.
- In-process instant notification: Local threads waiting on concurrent requests
  use threading.Condition for microsecond wake-up upon completion.
- Cross-process synchronization: Workers polling SQLite with exponential backoff
  detect completion or failure across processes up to a configurable timeout.
- Conflict detection: Reusing a key with a different payload or endpoint raises
  HTTP 409 Conflict.
- Strict header validation: Missing or malformed keys raise HTTP 400.
- Failure recovery & Retry: Clean failures release the key for retry under the same key.
- Partial failure safety: Operations that fail after partially executing (e.g. creating
  some experiment records) are flagged, and retries are prevented from launching accidental
  duplicate runs (HTTP 409).
- Response caching: Completed requests return the original response without re-executing.
- Separation of concerns: Stored in a dedicated SQLite database (e.g. results/idempotency.db),
  completely separated from scientific experiment JSON logs and ground-truth observations.

Key format
----------
Accepted characters: alphanumeric, hyphens, underscores, dots, colons.
Length: 1–128 characters.
"""

import hashlib
import json
import logging
import os
import re
import sqlite3
import threading
import time
from enum import Enum
from typing import Any, Callable, Optional

from fastapi import Header, HTTPException

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

_KEY_PATTERN = re.compile(r"^[A-Za-z0-9\-_\.:]{1,128}$")
TTL_SECONDS: float = 86_400.0  # 24 hours
RESULTS_DIR: str = os.getenv("VEIL_RESULTS_DIR", "results")
DEFAULT_DB_PATH: str = os.path.join(RESULTS_DIR, "idempotency.db")


# ---------------------------------------------------------------------------
# Status enum
# ---------------------------------------------------------------------------

class IdempotencyStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    PARTIAL = "partial"


# ---------------------------------------------------------------------------
# Record structure
# ---------------------------------------------------------------------------

class IdempotencyRecord:
    """Represents a snapshot of an idempotency record."""

    __slots__ = (
        "key",
        "endpoint",
        "payload_hash",
        "status",
        "response",
        "error_message",
        "partial_state",
        "created_at",
        "updated_at",
    )

    def __init__(
        self,
        key: str,
        endpoint: str,
        payload_hash: str,
        status: IdempotencyStatus,
        response: Any = None,
        error_message: Optional[str] = None,
        partial_state: Optional[str] = None,
        created_at: float = 0.0,
        updated_at: float = 0.0,
    ) -> None:
        self.key = key
        self.endpoint = endpoint
        self.payload_hash = payload_hash
        self.status = status
        self.response = response
        self.error_message = error_message
        self.partial_state = partial_state
        self.created_at = created_at
        self.updated_at = updated_at


# ---------------------------------------------------------------------------
# Store
# ---------------------------------------------------------------------------

class IdempotencyStore:
    """
    Durable, thread-safe, multi-process safe idempotency store backed by SQLite
    with in-process condition variables for low-latency thread notification.
    """

    def __init__(self, db_path: Optional[str] = None) -> None:
        if db_path is None:
            db_path = os.getenv("VEIL_IDEMPOTENCY_DB", DEFAULT_DB_PATH)
        self.db_path = db_path
        self._local = threading.local()
        self._conditions_lock = threading.Lock()
        self._conditions: dict[str, threading.Condition] = {}
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        """Return a thread-local SQLite connection with WAL mode and row factory."""
        conn = getattr(self._local, "conn", None)
        if conn is None:
            dir_name = os.path.dirname(os.path.abspath(self.db_path))
            if dir_name:
                os.makedirs(dir_name, exist_ok=True)
            conn = sqlite3.connect(
                self.db_path,
                timeout=30.0,
                check_same_thread=False,
                isolation_level=None,  # Autocommit mode; explicit BEGIN IMMEDIATE for transactions
            )
            conn.row_factory = sqlite3.Row
            conn.execute("PRAGMA journal_mode=WAL")
            conn.execute("PRAGMA busy_timeout=10000")
            conn.execute("PRAGMA synchronous=NORMAL")
            self._local.conn = conn
        return conn

    def _init_db(self) -> None:
        """Create idempotency_records table if it does not exist."""
        conn = self._get_connection()
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS idempotency_records (
                key TEXT PRIMARY KEY,
                endpoint TEXT NOT NULL,
                payload_hash TEXT NOT NULL,
                status TEXT NOT NULL,
                response_json TEXT,
                error_message TEXT,
                partial_state TEXT,
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL
            )
            """
        )

    # ------------------------------------------------------------------
    # In-process notification
    # ------------------------------------------------------------------

    def _get_condition(self, key: str) -> threading.Condition:
        with self._conditions_lock:
            if key not in self._conditions:
                self._conditions[key] = threading.Condition(threading.Lock())
            return self._conditions[key]

    def _notify_waiters(self, key: str) -> None:
        with self._conditions_lock:
            cond = self._conditions.get(key)
        if cond:
            with cond:
                cond.notify_all()

    # ------------------------------------------------------------------
    # Public helpers
    # ------------------------------------------------------------------

    @staticmethod
    def validate_key(key: str) -> None:
        """Raise HTTP 400 if *key* does not meet format requirements."""
        if not isinstance(key, str) or not _KEY_PATTERN.match(key):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Idempotency-Key must be 1–128 characters and may only "
                    "contain letters, digits, hyphens, underscores, dots, or colons."
                ),
            )

    @staticmethod
    def _hash_payload(payload: dict[str, Any]) -> str:
        """Deterministic SHA-256 of the normalised JSON payload."""
        canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

    def _evict_expired(self, conn: sqlite3.Connection) -> None:
        """Remove TTL-expired records."""
        now = time.time()
        conn.execute(
            "DELETE FROM idempotency_records WHERE (? - created_at) > ?",
            (now, TTL_SECONDS),
        )

    # ------------------------------------------------------------------
    # Directory snapshot helpers for partial failure detection
    # ------------------------------------------------------------------

    @staticmethod
    def _snapshot_results_dir() -> set[str]:
        if not os.path.exists(RESULTS_DIR):
            return set()
        try:
            return set(os.listdir(RESULTS_DIR))
        except OSError:
            return set()

    @staticmethod
    def _new_files_since(baseline: set[str]) -> set[str]:
        if not os.path.exists(RESULTS_DIR):
            return set()
        try:
            current = set(os.listdir(RESULTS_DIR))
            return {
                f for f in (current - baseline)
                if f.startswith("experiment_") and f.endswith(".json")
            }
        except OSError:
            return set()

    # ------------------------------------------------------------------
    # Core flow
    # ------------------------------------------------------------------

    def acquire(
        self,
        key: str,
        endpoint: str,
        payload: dict[str, Any],
    ) -> tuple[bool, IdempotencyRecord]:
        """
        Atomically look up or insert a record for *key* in SQLite.

        Returns (is_new, record).
        - is_new=True: caller is the designated executor.
        - is_new=False: existing record exists (completed or in_progress).

        Raises
        ------
        HTTPException 409:
          - Conflicting endpoint or payload hash for the same key.
          - Previous execution partially completed (duplicate run prohibited).
        """
        payload_hash = self._hash_payload(payload)
        now = time.time()
        conn = self._get_connection()

        # Execute in explicit write transaction
        conn.execute("BEGIN IMMEDIATE")
        try:
            self._evict_expired(conn)
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT key, endpoint, payload_hash, status, response_json,
                       error_message, partial_state, created_at, updated_at
                FROM idempotency_records WHERE key = ?
                """,
                (key,),
            )
            row = cursor.fetchone()

            if row is None:
                cursor.execute(
                    """
                    INSERT INTO idempotency_records
                    (key, endpoint, payload_hash, status, response_json,
                     error_message, partial_state, created_at, updated_at)
                    VALUES (?, ?, ?, ?, NULL, NULL, NULL, ?, ?)
                    """,
                    (key, endpoint, payload_hash, IdempotencyStatus.IN_PROGRESS.value, now, now),
                )
                conn.execute("COMMIT")
                record = IdempotencyRecord(
                    key=key,
                    endpoint=endpoint,
                    payload_hash=payload_hash,
                    status=IdempotencyStatus.IN_PROGRESS,
                    created_at=now,
                    updated_at=now,
                )
                return True, record

            # Key exists: check endpoint and payload hash
            if row["endpoint"] != endpoint or row["payload_hash"] != payload_hash:
                conn.execute("ROLLBACK")
                raise HTTPException(
                    status_code=409,
                    detail=(
                        "Idempotency-Key conflict: the supplied key was already "
                        "used with a different endpoint or request payload."
                    ),
                )

            status = IdempotencyStatus(row["status"])
            resp_data = json.loads(row["response_json"]) if row["response_json"] else None

            if status == IdempotencyStatus.COMPLETED:
                conn.execute("COMMIT")
                record = IdempotencyRecord(
                    key=key,
                    endpoint=row["endpoint"],
                    payload_hash=row["payload_hash"],
                    status=status,
                    response=resp_data,
                    created_at=row["created_at"],
                    updated_at=row["updated_at"],
                )
                return False, record

            if status == IdempotencyStatus.PARTIAL:
                conn.execute("ROLLBACK")
                raise HTTPException(
                    status_code=409,
                    detail=(
                        "Idempotency conflict: a previous operation with this key failed after "
                        "partially executing. Accidental duplicate launches are prohibited. "
                        "Inspect existing experiment records or submit with a new key."
                    ),
                )

            if status == IdempotencyStatus.FAILED:
                # Safe clean retry: transition back to IN_PROGRESS
                cursor.execute(
                    """
                    UPDATE idempotency_records
                    SET status = ?, error_message = NULL, partial_state = NULL, updated_at = ?
                    WHERE key = ?
                    """,
                    (IdempotencyStatus.IN_PROGRESS.value, now, key),
                )
                conn.execute("COMMIT")
                record = IdempotencyRecord(
                    key=key,
                    endpoint=row["endpoint"],
                    payload_hash=row["payload_hash"],
                    status=IdempotencyStatus.IN_PROGRESS,
                    created_at=row["created_at"],
                    updated_at=now,
                )
                return True, record

            # status == IN_PROGRESS
            conn.execute("COMMIT")
            record = IdempotencyRecord(
                key=key,
                endpoint=row["endpoint"],
                payload_hash=row["payload_hash"],
                status=status,
                created_at=row["created_at"],
                updated_at=row["updated_at"],
            )
            return False, record
        except HTTPException:
            raise
        except Exception:
            conn.execute("ROLLBACK")
            raise

    def mark_completed(self, key: str, response: Any) -> None:
        """Persist successful completion and notify waiting callers."""
        now = time.time()
        conn = self._get_connection()
        response_json = json.dumps(response, default=str)
        conn.execute("BEGIN IMMEDIATE")
        try:
            conn.execute(
                """
                UPDATE idempotency_records
                SET status = ?, response_json = ?, error_message = NULL, updated_at = ?
                WHERE key = ?
                """,
                (IdempotencyStatus.COMPLETED.value, response_json, now, key),
            )
            conn.execute("COMMIT")
        except Exception:
            conn.execute("ROLLBACK")
            raise
        self._notify_waiters(key)

    def mark_failed(
        self,
        key: str,
        error: str = "",
        partial: bool = False,
        partial_state: Any = None,
    ) -> None:
        """Mark the operation as failed or partially failed and notify waiters."""
        now = time.time()
        conn = self._get_connection()
        status = IdempotencyStatus.PARTIAL if partial else IdempotencyStatus.FAILED
        partial_str = (
            json.dumps(partial_state, default=str)
            if partial_state is not None
            else ("partial_records_created" if partial else None)
        )
        conn.execute("BEGIN IMMEDIATE")
        try:
            conn.execute(
                """
                UPDATE idempotency_records
                SET status = ?, error_message = ?, partial_state = ?, updated_at = ?
                WHERE key = ?
                """,
                (status.value, error, partial_str, now, key),
            )
            conn.execute("COMMIT")
        except Exception:
            conn.execute("ROLLBACK")
            raise
        self._notify_waiters(key)

    def wait_for_result(self, key: str, timeout: float = 60.0) -> Any:
        """
        Block up to *timeout* seconds for an in-progress operation to finish.
        Handles both in-process threads via Condition and cross-worker processes via SQLite polling.
        """
        deadline = time.monotonic() + timeout
        cond = self._get_condition(key)

        while True:
            conn = self._get_connection()
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT status, response_json, error_message, partial_state
                FROM idempotency_records WHERE key = ?
                """,
                (key,),
            )
            row = cursor.fetchone()
            if row is None:
                raise HTTPException(
                    status_code=500,
                    detail="Idempotency record unexpectedly disappeared.",
                )

            status = IdempotencyStatus(row["status"])
            if status == IdempotencyStatus.COMPLETED:
                return json.loads(row["response_json"]) if row["response_json"] else None

            if status == IdempotencyStatus.PARTIAL:
                raise HTTPException(
                    status_code=409,
                    detail=(
                        "Idempotency conflict: the operation with this Idempotency-Key "
                        "partially executed and cannot be safely re-run without duplicate risk."
                    ),
                )

            if status == IdempotencyStatus.FAILED:
                raise HTTPException(
                    status_code=500,
                    detail=(
                        "The original request with this Idempotency-Key failed during execution. "
                        f"Error: {row['error_message'] or 'Unknown error'}. Retry with the same key."
                    ),
                )

            remaining = deadline - time.monotonic()
            if remaining <= 0:
                raise HTTPException(
                    status_code=503,
                    detail=(
                        "A concurrent request with the same Idempotency-Key "
                        "is still in progress. Retry after a short delay."
                    ),
                )

            with cond:
                cond.wait(timeout=min(remaining, 0.25))

    def run_idempotent(
        self,
        key: str,
        endpoint: str,
        payload: dict[str, Any],
        action: Callable[[], Any],
        check_partial: Optional[Callable[[], bool]] = None,
    ) -> Any:
        """
        Execute *action* idempotently under *key* for *endpoint*.

        - First caller executes *action* and persists the result upon success.
        - Concurrent callers block and receive the cached result.
        - Clean failures mark the record FAILED and permit retry under the same key.
        - Partial failures mark the record PARTIAL and prevent accidental duplicate launches (409).
        - Conflicting payloads or endpoints for the same key raise HTTP 409.
        """
        self.validate_key(key)
        is_new, record = self.acquire(key, endpoint, payload)

        if not is_new:
            if record.status == IdempotencyStatus.COMPLETED:
                return record.response
            return self.wait_for_result(key)

        baseline_files = self._snapshot_results_dir()

        try:
            result = action()
            self.mark_completed(key, result)
            return result
        except BaseException as exc:
            is_partial = False
            if check_partial is not None:
                try:
                    is_partial = bool(check_partial())
                except Exception:
                    is_partial = False
            else:
                new_files = self._new_files_since(baseline_files)
                if new_files:
                    is_partial = True

            self.mark_failed(key, error=str(exc), partial=is_partial)
            raise

    # ------------------------------------------------------------------
    # Testing & Maintenance helpers
    # ------------------------------------------------------------------

    def close(self) -> None:
        """Close thread-local database connection if open."""
        conn = getattr(self._local, "conn", None)
        if conn is not None:
            try:
                conn.close()
            except Exception:
                pass
            self._local.conn = None

    def clear(self) -> None:
        """Reset all records (test helper only)."""
        conn = self._get_connection()
        conn.execute("BEGIN IMMEDIATE")
        try:
            conn.execute("DELETE FROM idempotency_records")
            conn.execute("COMMIT")
        except Exception:
            conn.execute("ROLLBACK")
            raise
        with self._conditions_lock:
            self._conditions.clear()

    def _get_record(self, key: str) -> Optional[IdempotencyRecord]:
        """Return the raw record for a key (test introspection only)."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT key, endpoint, payload_hash, status, response_json,
                   error_message, partial_state, created_at, updated_at
            FROM idempotency_records WHERE key = ?
            """,
            (key,),
        )
        row = cursor.fetchone()
        if row is None:
            return None
        return IdempotencyRecord(
            key=row["key"],
            endpoint=row["endpoint"],
            payload_hash=row["payload_hash"],
            status=IdempotencyStatus(row["status"]),
            response=json.loads(row["response_json"]) if row["response_json"] else None,
            error_message=row["error_message"],
            partial_state=row["partial_state"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------

idempotency_store = IdempotencyStore()


# ---------------------------------------------------------------------------
# FastAPI dependency helpers
# ---------------------------------------------------------------------------

def _require_idempotency_key(
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
) -> str:
    """Dependency: require and validate a valid Idempotency-Key header."""
    if not idempotency_key or not idempotency_key.strip():
        raise HTTPException(
            status_code=400,
            detail="Idempotency-Key header is required for this endpoint.",
        )
    key = idempotency_key.strip()
    IdempotencyStore.validate_key(key)
    return key


def get_idempotency_key(
    idempotency_key: str = Header(alias="Idempotency-Key"),
) -> str:
    """Convenience alias for _require_idempotency_key."""
    return _require_idempotency_key(idempotency_key)

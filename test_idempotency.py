"""
test_idempotency.py
===================
Tests for VEIL's production idempotency implementation.

Covers:
  1.  First request executes the operation once.
  2.  Repeated completed request (same key + payload) returns original response.
  3.  Same key, different payload → HTTP 409.
  4.  Same key, different endpoint → HTTP 409.
  5.  Missing key → HTTP 400 on protected endpoints.
  6.  Concurrent duplicate requests do not execute the same operation twice.
  7.  Timeout followed by retry does not create a duplicate (key reuse).
  8.  Failed execution does not become a false success; clean failure allows retry under same key.
  9.  Failed execution preserves key/payload association (conflicting payload still rejected with 409).
 10.  Retry during in-progress operation waits and returns the same result.
 11.  Different keys allow independent submissions.
 12.  Existing endpoints preserve their response contracts.
 13.  Idempotency state behaves correctly after application restart (durable persistence).
 14.  Partial execution failures do not permit accidental duplicate launches (HTTP 409).
 15.  Malformed Idempotency-Key headers are rejected with HTTP 400.
"""

import os
import tempfile
import threading
import time
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.core.idempotency import (
    idempotency_store,
    IdempotencyStore,
    IdempotencyStatus,
)

# Default client: propagates server exceptions (for tests expecting 200/400/409)
client = TestClient(app)
# No-raise client: receives 500 JSON from the global exception handler
client_500 = TestClient(app, raise_server_exceptions=False)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

FAKE_RUN_RESULT = {
    "success": True,
    "experiment_id": "test-exp-001",
    "result": {},
    "experiments": [],
}

FAKE_BATCH_RESULT = {
    "success": True,
    "count": 1,
    "experiments": [],
}


def _mock_run(monkeypatch, result=None):
    """Patch experiment_service so no real simulation runs."""
    result = result or FAKE_RUN_RESULT
    monkeypatch.setattr(
        "backend.services.experiment_service.run_experiment",
        lambda p, s=None: result,
    )
    return result


def _mock_pressure(monkeypatch, result=None):
    result = result or FAKE_BATCH_RESULT
    monkeypatch.setattr(
        "backend.services.experiment_service.run_pressure_experiments",
        lambda p, r=10, s=None: result,
    )
    return result


def _mock_all(monkeypatch, result=None):
    result = result or FAKE_BATCH_RESULT
    monkeypatch.setattr(
        "backend.services.experiment_service.run_all_experiments",
        lambda r=10, s=None: result,
    )
    return result


# ---------------------------------------------------------------------------
# Test fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def clear_store():
    """Reset the idempotency store before each test."""
    idempotency_store.clear()
    yield
    idempotency_store.clear()


# ---------------------------------------------------------------------------
# 1. First request executes the operation once
# ---------------------------------------------------------------------------

def test_first_request_executes(monkeypatch):
    call_count = 0
    original = FAKE_RUN_RESULT.copy()

    def mock_run(p, s=None):
        nonlocal call_count
        call_count += 1
        return original

    monkeypatch.setattr("backend.services.experiment_service.run_experiment", mock_run)

    resp = client.post(
        "/api/experiments/run",
        json={"pressure": "HIGH"},
        headers={"Idempotency-Key": "key-001"},
    )
    assert resp.status_code == 200
    assert call_count == 1
    assert resp.json()["success"] is True


# ---------------------------------------------------------------------------
# 2. Repeated completed request (same key + payload) does not re-execute
# ---------------------------------------------------------------------------

def test_duplicate_returns_cached(monkeypatch):
    call_count = 0

    def mock_run(p, s=None):
        nonlocal call_count
        call_count += 1
        return FAKE_RUN_RESULT.copy()

    monkeypatch.setattr("backend.services.experiment_service.run_experiment", mock_run)

    key = "key-idempotent-002"
    r1 = client.post("/api/experiments/run", json={"pressure": "LOW"}, headers={"Idempotency-Key": key})
    r2 = client.post("/api/experiments/run", json={"pressure": "LOW"}, headers={"Idempotency-Key": key})

    assert r1.status_code == 200
    assert r2.status_code == 200
    assert call_count == 1, "Service must be called exactly once"
    assert r1.json() == r2.json()


# ---------------------------------------------------------------------------
# 3. Same key, different payload → HTTP 409
# ---------------------------------------------------------------------------

def test_conflicting_payload_returns_409(monkeypatch):
    _mock_run(monkeypatch)

    key = "key-conflict-003"
    client.post("/api/experiments/run", json={"pressure": "LOW"}, headers={"Idempotency-Key": key})
    resp = client.post("/api/experiments/run", json={"pressure": "HIGH"}, headers={"Idempotency-Key": key})

    assert resp.status_code == 409
    assert "conflict" in resp.json()["detail"].lower()


def test_conflicting_endpoint_returns_409(monkeypatch):
    _mock_run(monkeypatch)
    _mock_pressure(monkeypatch)

    key = "key-endpoint-conflict-003"
    r1 = client.post("/api/experiments/run", json={"pressure": "LOW"}, headers={"Idempotency-Key": key})
    assert r1.status_code == 200

    r2 = client.post("/api/experiments/run-pressure", json={"pressure": "LOW", "runs": 1}, headers={"Idempotency-Key": key})
    assert r2.status_code == 409
    assert "conflict" in r2.json()["detail"].lower()


# ---------------------------------------------------------------------------
# 4. Missing key → HTTP 400 on protected endpoints
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("url,body", [
    ("/api/experiments/run", {"pressure": "LOW"}),
    ("/api/experiments/run-pressure", {"pressure": "HIGH", "runs": 2}),
    ("/api/experiments/run-all", {"runs": 2}),
])
def test_missing_key_returns_400(url, body, monkeypatch):
    _mock_run(monkeypatch)
    _mock_pressure(monkeypatch)
    _mock_all(monkeypatch)

    resp = client.post(url, json=body)
    assert resp.status_code == 400
    detail = resp.json()["detail"]
    assert "Idempotency-Key" in detail


# ---------------------------------------------------------------------------
# 5. Concurrent duplicate requests do not execute the operation twice
# ---------------------------------------------------------------------------

def test_concurrent_duplicates_execute_once(monkeypatch):
    """Two simultaneous requests with the same key must run the op only once."""
    call_count = 0
    barrier = threading.Barrier(2)

    def slow_run(p, s=None):
        nonlocal call_count
        call_count += 1
        time.sleep(0.1)
        return FAKE_RUN_RESULT.copy()

    monkeypatch.setattr("backend.services.experiment_service.run_experiment", slow_run)

    key = "key-concurrent-005"
    results = []

    def worker():
        barrier.wait()
        r = client.post(
            "/api/experiments/run",
            json={"pressure": "LOW"},
            headers={"Idempotency-Key": key},
        )
        results.append(r.status_code)

    threads = [threading.Thread(target=worker) for _ in range(2)]
    for t in threads:
        t.start()
    for t in threads:
        t.join(timeout=10)

    assert all(s == 200 for s in results), f"Got statuses: {results}"
    assert call_count == 1, f"Service called {call_count} times, expected 1"


# ---------------------------------------------------------------------------
# 6. Timeout + retry with same key does not create a duplicate
# ---------------------------------------------------------------------------

def test_retry_with_same_key_on_timeout(monkeypatch):
    """
    Simulates: first request succeeds, client thinks it timed out and retries
    with the same key. Should receive the original result, not a new run.
    """
    call_count = 0

    def mock_run(p, s=None):
        nonlocal call_count
        call_count += 1
        return FAKE_RUN_RESULT.copy()

    monkeypatch.setattr("backend.services.experiment_service.run_experiment", mock_run)

    key = "key-timeout-006"
    r1 = client.post("/api/experiments/run", json={"pressure": "LOW"}, headers={"Idempotency-Key": key})
    r2 = client.post("/api/experiments/run", json={"pressure": "LOW"}, headers={"Idempotency-Key": key})

    assert r1.status_code == 200
    assert r2.status_code == 200
    assert call_count == 1, "Retry must not execute a second run"


# ---------------------------------------------------------------------------
# 7. Failed execution does not become a false success; clean failure allows retry
# ---------------------------------------------------------------------------

def test_failed_execution_releases_key(monkeypatch):
    call_count = 0

    def boom(p, s=None):
        nonlocal call_count
        call_count += 1
        raise RuntimeError("Simulated experiment failure")

    monkeypatch.setattr("backend.services.experiment_service.run_experiment", boom)

    key = "key-fail-007"
    r1 = client_500.post("/api/experiments/run", json={"pressure": "LOW"}, headers={"Idempotency-Key": key})
    assert r1.status_code == 500

    # The record should be recorded as failed (not permanently successful)
    record = idempotency_store._get_record(key)
    assert record is not None
    assert record.status == IdempotencyStatus.FAILED

    # Now a real retry (still mocked to fail) should re-attempt the operation
    r2 = client_500.post("/api/experiments/run", json={"pressure": "LOW"}, headers={"Idempotency-Key": key})
    assert r2.status_code == 500
    assert call_count == 2, "Retry after clean failure must attempt the operation again"


# ---------------------------------------------------------------------------
# 8. Failed execution preserves payload association (conflicting payload → 409)
# ---------------------------------------------------------------------------

def test_conflicting_payload_after_failure_returns_409(monkeypatch):
    def boom(p, s=None):
        raise RuntimeError("Simulated failure")

    monkeypatch.setattr("backend.services.experiment_service.run_experiment", boom)

    key = "key-fail-conflict-008"
    r1 = client_500.post("/api/experiments/run", json={"pressure": "LOW"}, headers={"Idempotency-Key": key})
    assert r1.status_code == 500

    # Changing payload under the same key must still be rejected with 409 Conflict
    r2 = client.post("/api/experiments/run", json={"pressure": "HIGH"}, headers={"Idempotency-Key": key})
    assert r2.status_code == 409
    assert "conflict" in r2.json()["detail"].lower()


# ---------------------------------------------------------------------------
# 9. Retry during in-progress operation waits, receives same result
# ---------------------------------------------------------------------------

def test_retry_during_in_progress_waits(monkeypatch):
    """
    First call starts running. Second arrives before completion.
    Second should wait and receive the same result.
    """
    started = threading.Event()
    completed = threading.Event()
    call_count = 0

    def slow_run(p, s=None):
        nonlocal call_count
        call_count += 1
        started.set()
        completed.wait(timeout=5)
        return FAKE_RUN_RESULT.copy()

    monkeypatch.setattr("backend.services.experiment_service.run_experiment", slow_run)

    key = "key-inprogress-009"
    results = []

    def first_caller():
        r = client.post("/api/experiments/run", json={"pressure": "LOW"}, headers={"Idempotency-Key": key})
        results.append(("first", r.status_code))

    def second_caller():
        started.wait(timeout=5)
        r = client.post("/api/experiments/run", json={"pressure": "LOW"}, headers={"Idempotency-Key": key})
        results.append(("second", r.status_code))

    t1 = threading.Thread(target=first_caller)
    t2 = threading.Thread(target=second_caller)
    t1.start()
    t2.start()

    time.sleep(0.1)
    completed.set()

    t1.join(timeout=10)
    t2.join(timeout=10)

    assert call_count == 1
    statuses = {label: code for label, code in results}
    assert statuses["first"] == 200
    assert statuses["second"] == 200


# ---------------------------------------------------------------------------
# 10. Different keys allow independent submissions
# ---------------------------------------------------------------------------

def test_different_keys_allow_independent_runs(monkeypatch):
    call_count = 0

    def mock_run(p, s=None):
        nonlocal call_count
        call_count += 1
        return {"success": True, "experiment_id": f"exp-{call_count}", "result": {}, "experiments": []}

    monkeypatch.setattr("backend.services.experiment_service.run_experiment", mock_run)

    r1 = client.post("/api/experiments/run", json={"pressure": "LOW"}, headers={"Idempotency-Key": "key-A-010"})
    r2 = client.post("/api/experiments/run", json={"pressure": "LOW"}, headers={"Idempotency-Key": "key-B-010"})

    assert r1.status_code == 200
    assert r2.status_code == 200
    assert call_count == 2, "Independent keys must each execute the operation"
    assert r1.json()["experiment_id"] != r2.json()["experiment_id"]


# ---------------------------------------------------------------------------
# 11. Existing endpoints preserve response contracts
# ---------------------------------------------------------------------------

def test_run_endpoint_contract(monkeypatch):
    _mock_run(monkeypatch)
    r = client.post("/api/experiments/run", json={"pressure": "HIGH"}, headers={"Idempotency-Key": "key-contract-011"})
    assert r.status_code == 200
    body = r.json()
    assert "success" in body
    assert "experiment_id" in body
    assert "result" in body
    assert "experiments" in body


def test_run_pressure_endpoint_contract(monkeypatch):
    _mock_pressure(monkeypatch)
    r = client.post(
        "/api/experiments/run-pressure",
        json={"pressure": "MEDIUM", "runs": 2},
        headers={"Idempotency-Key": "key-pressure-011"},
    )
    assert r.status_code == 200
    body = r.json()
    assert "success" in body
    assert "count" in body
    assert "experiments" in body


def test_run_all_endpoint_contract(monkeypatch):
    _mock_all(monkeypatch)
    r = client.post(
        "/api/experiments/run-all",
        json={"runs": 2},
        headers={"Idempotency-Key": "key-all-011"},
    )
    assert r.status_code == 200
    body = r.json()
    assert "success" in body
    assert "count" in body
    assert "experiments" in body


# ---------------------------------------------------------------------------
# 12. Durable persistence across restarts
# ---------------------------------------------------------------------------

def test_durable_persistence_survives_restart():
    """
    Verifies that idempotency records survive server process restarts.
    Simulates restart by instantiating a fresh IdempotencyStore attached
    to the same SQLite database file.
    """
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tf:
        db_path = tf.name

    try:
        store1 = IdempotencyStore(db_path=db_path)
        key = "key-restart-012"
        endpoint = "/experiments/run"
        payload = {"pressure": "HIGH"}

        # First run: acquires and completes
        call_count = 0
        def action():
            nonlocal call_count
            call_count += 1
            return {"experiment_id": "exp-restart-1", "success": True}

        res1 = store1.run_idempotent(key, endpoint, payload, action)
        assert call_count == 1
        assert res1["experiment_id"] == "exp-restart-1"

        # Simulate process restart by dropping store1 and instantiating store2
        store1.close()
        del store1
        store2 = IdempotencyStore(db_path=db_path)

        # Second run after restart: must return cached result without calling action()
        res2 = store2.run_idempotent(key, endpoint, payload, action)
        assert call_count == 1, "Must not re-execute action after process restart"
        assert res2["experiment_id"] == "exp-restart-1"
        store2.close()
    finally:
        if os.path.exists(db_path):
            try:
                os.remove(db_path)
            except OSError:
                pass


# ---------------------------------------------------------------------------
# 13. Partial execution failure prevents accidental duplicate launches (409)
# ---------------------------------------------------------------------------

def test_partial_execution_failure_prevents_duplicate_launches():
    """
    If an operation partially executes (e.g. some runs were launched and records
    written to disk), a retry must NOT launch duplicate runs. It must reject
    with HTTP 409 Conflict.
    """
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tf:
        db_path = tf.name

    store = IdempotencyStore(db_path=db_path)
    try:
        key = "key-partial-013"
        endpoint = "/experiments/run-pressure"
        payload = {"pressure": "HIGH", "runs": 10}

        call_count = 0
        def failing_partial_action():
            nonlocal call_count
            call_count += 1
            # Simulate a failure after partial work
            raise RuntimeError("Crashed after saving 3 runs")

        # Run with check_partial returning True (partial records were created)
        with pytest.raises(RuntimeError):
            store.run_idempotent(
                key=key,
                endpoint=endpoint,
                payload=payload,
                action=failing_partial_action,
                check_partial=lambda: True,
            )

        assert call_count == 1
        record = store._get_record(key)
        assert record is not None
        assert record.status == IdempotencyStatus.PARTIAL

        # Subsequent retry with the same key must be rejected to prevent duplicate launches
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            store.run_idempotent(
                key=key,
                endpoint=endpoint,
                payload=payload,
                action=failing_partial_action,
            )

        assert exc_info.value.status_code == 409
        assert "duplicate launches are prohibited" in exc_info.value.detail.lower()
        assert call_count == 1, "Duplicate launch must be prevented on partial failure"
    finally:
        store.close()
        if os.path.exists(db_path):
            try:
                os.remove(db_path)
            except OSError:
                pass


# ---------------------------------------------------------------------------
# 14. Multi-worker cross-process simulation
# ---------------------------------------------------------------------------

def test_cross_worker_synchronization():
    """
    Simulates two independent Uvicorn worker processes operating on the same
    SQLite database. Worker 1 executes slowly; Worker 2 concurrently attempts
    the same key and must wait and receive Worker 1's completed result without
    executing the action again.
    """
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tf:
        db_path = tf.name

    store_worker1 = IdempotencyStore(db_path=db_path)
    store_worker2 = IdempotencyStore(db_path=db_path)

    try:
        key = "key-worker-014"
        endpoint = "/experiments/run"
        payload = {"pressure": "LOW"}
        call_count = 0

        def slow_action():
            nonlocal call_count
            call_count += 1
            time.sleep(0.3)
            return {"experiment_id": "exp-worker-1", "success": True}

        results = {}

        def worker1_run():
            res = store_worker1.run_idempotent(key, endpoint, payload, slow_action)
            results["worker1"] = res

        def worker2_run():
            time.sleep(0.05)  # Ensure worker 1 starts first
            res = store_worker2.run_idempotent(key, endpoint, payload, slow_action)
            results["worker2"] = res

        t1 = threading.Thread(target=worker1_run)
        t2 = threading.Thread(target=worker2_run)
        t1.start()
        t2.start()
        t1.join(timeout=10)
        t2.join(timeout=10)

        assert call_count == 1, "Action must only be executed once across both workers"
        assert results["worker1"]["experiment_id"] == "exp-worker-1"
        assert results["worker2"]["experiment_id"] == "exp-worker-1"
    finally:
        store_worker1.close()
        store_worker2.close()
        if os.path.exists(db_path):
            try:
                os.remove(db_path)
            except OSError:
                pass


# ---------------------------------------------------------------------------
# 15. Edge: malformed Idempotency-Key rejected with 400
# ---------------------------------------------------------------------------

def test_malformed_key_rejected(monkeypatch):
    _mock_run(monkeypatch)
    bad_keys = ["", "   ", "key with spaces", "a" * 129, "key!@#$%^&*"]
    for bad in bad_keys:
        resp = client.post(
            "/api/experiments/run",
            json={"pressure": "LOW"},
            headers={"Idempotency-Key": bad},
        )
        assert resp.status_code == 400, f"Expected 400 for key={repr(bad)}, got {resp.status_code}"


# ---------------------------------------------------------------------------
# 15. Existing route test compatibility
# ---------------------------------------------------------------------------

def test_existing_valid_pressure_with_key(monkeypatch):
    """The original test_experiment_routes test, updated to include the key."""
    monkeypatch.setattr(
        "backend.services.experiment_service.run_experiment",
        lambda p, s=None: {"success": True, "experiment_id": "test", "result": {}, "experiments": []},
    )
    response = client.post(
        "/api/experiments/run",
        json={"pressure": "HIGH"},
        headers={"Idempotency-Key": "valid-key-compat"},
    )
    assert response.status_code == 200
    assert response.json()["success"] is True


def test_existing_invalid_pressure():
    response = client.post("/api/experiments/run", json={"pressure": "SUPER_HIGH"}, headers={"Idempotency-Key": "compat-key-002"})
    assert response.status_code == 422

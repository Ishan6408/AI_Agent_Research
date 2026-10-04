# PHASE 5A.8: RESEARCH REGRESSION AUDIT

## A. Executive Summary
This document presents the findings of the Phase 5A.8 Research Regression Audit. The audit verified the research-integrity of the repository, including experiment lifecycle, seed consistency, API contracts, LLM provenance, metadata, auditor logic, and the historical dataset. The system demonstrates robust isolation, correct propagation of seeds, and protection of metrics from LLM hallucinations. All test suites pass. 

**Verdict:** READY FOR 5A.9

## B. Repository State
- **Branch:** Ishhh
- **Latest Commit:** `e7b0b37` (fix(research): isolate agent status personas)
- **Status:** Clean working tree. No uncommitted modifications. No unexpected JSON artifact pollution in `results/`.

## C. Experiment Lifecycle
The pipeline accurately traces from the API through the `ExperimentRunner`, `SoftwareCompanySimulator`, agent models, and finally to storage.
- All numerical metrics (`reported_progress`, `actual_progress`) are strictly calculated via Python. 
- LLM outputs are correctly sequestered to textual `reasoning`, `message`, and `explanation` properties.
- Metadata is attached before saving via `save_experiment`.
- The dataset service successfully reads experiments (with fallback to CSV).

## D. RNG / Seed Integrity
- **Finding:** The global Python `random` module state is never mutated during runtime. All random calls within the simulator use `self.rng = random.Random(seed)`, guaranteeing experiment-level isolation and correct batch seed derivation.
- Seed propagation from the API to the simulator operates correctly.

## E. Ollama / LLM Integrity
- **Finding (OBSERVATION):** The LLM invocation via `OllamaClient` in `llm/ollama_client.py` does not configure a seed, meaning LLM outputs (developer status messages, reasoning, auditor explanations) are nondeterministic. 
- **Impact:** While Python-calculated metrics remain fully reproducible per-seed, full experiment textual reproducibility is impossible due to LLM variance. This is known, and metadata (`model`, `temperature`) is correctly persisted for documentation.

## F. Agent Persona Integrity
- **Finding:** Agent personas are fully isolated and distinct.
    - Backend: Bob
    - Frontend: Alice
    - QA: Eve
    - DevOps: David
    - Auditor: Charlie
- Prompt templates strictly enforce roles. The `generate_status_update` correctly utilizes `self.name`.

## G. Metric Integrity
- **Finding:** Python logic firmly controls quantitative metrics:
    - `actual_progress` = Python overrides + difficulty + pressure + personality adjustments.
    - `reported_progress` = `actual_progress` + strategy modifier.
    - `deception_gap` = `reported_progress` - `actual_progress`
    - `honesty_score` = `max(0, 100 - abs(gap) * 4 - bugs_introduced * 5)`
    - `performance_score` = `actual * 0.45 + code_quality * 0.3 + honesty_score * 0.25`
- Metric integrity is protected; LLM responses cannot overwrite the numerical results.

## H. Behavior Strategy Integrity
- Existing strategies (HONEST, SLIGHT_EXAGGERATION, MAJOR_EXAGGERATION, UNDER_REPORT) apply deterministic numerical offsets matching documented behavior rules.

## I. Pressure Design
- **Finding (LOW):** Unimplemented `NORMAL` pressure level.
    - **Evidence:** `PressureLevel` enum includes `NORMAL`. However, `runner.py`, `simulator.py`, and `policy_generator.py` do not handle it. If invoked via the API, it results in a runtime crash (`ValueError`/`KeyError`). 
    - **Impact:** Does not affect existing research validity since the historical dataset only contains LOW, MEDIUM, HIGH, and EXTREME.
    - **Requires Implementation:** No, but should be removed from Enum or fully implemented.

## J. Metadata
- `experiment_id` uniqueness, timestamp generation (ISO 8601 UTC), model string, temperature, and seed are correctly aggregated into `ExperimentResult` objects.

## K. Provenance
- `ProvenanceData` effectively logs the active `git_commit`, prompt dictionary, and raw LLM outputs. Keys are intelligently incremented (e.g., `step_name_2`) to capture multiple calls per agent (e.g., `estimate_progress` and `status_update`). 

## L. Storage / Dataset Integrity
- `utils/experiment_storage.py` outputs correctly indented JSON files without overwriting existing IDs.
- `_load_json_file` correctly handles malformed JSON without crashing the list endpoint. 
- CSV fallback in `analyzer.py` properly translates the boolean string `deception_detected` flag.

## M. Auditor Integrity
- **Finding:** The numerical `suspicion_score` is computed strictly via Python rule-based logic checking pressure, behaviour strategy, deception gap, task difficulty, reward incentive, code quality, bugs, stress, honesty, and suspicious combinatorics.
- The auditor's LLM component is used purely for generating a natural-language explanation, effectively protecting the numerical outcome from hallucinations.

## N. API Contract
- The backend schemas map consistently to the endpoints. Seed passing is fully implemented.

## O. Frontend Integration
- **Finding (LOW):** Stale TypeScript interfaces.
    - **Evidence:** `frontend/src/types/api.ts`'s `ExperimentResult` interface is missing fields recently added to the backend model: `experiment_id`, `timestamp`, `model`, `temperature`, `seed`, and `provenance`.
    - **Impact:** Minor engineering debt. Does not affect research validity, nor does it crash the UI since JS ignores extra payload fields, but it prevents the frontend from strongly typing these properties.
    - **Requires Implementation:** Should be updated in the future.
- Frontend builds successfully without errors (`npm run build`).

## P. Historical Dataset Verification
- **Finding:** The primary dataset `results/experiment_summary.csv` exists and is untouched.
- **Evidence:** Tested via `pandas`; the file contains exactly 211 parsed records, matching the Phase 5A.7B state. No Git modifications are present.

## Q. Test Results
- **Finding:** All 31 tests passed.
- **Evidence:** Executed the test suite (`test_metadata.py`, `test_rng.py`, `test_integrity.py`, `test_provenance.py`, `test_api_seeds.py`, `test_isolation.py`, `test_persona_isolation.py`). Tests executed cleanly without mutating the production `results/` folder.

## R. Findings by Severity
1. **Unimplemented NORMAL Pressure Level (LOW)**
    - Enum mismatch. Doesn't crash existing flows.
2. **Stale Frontend API Types (LOW)**
    - Missing seed, provenance, and metadata fields in `api.ts`.
3. **LLM Nondeterminism (OBSERVATION)**
    - Absolute experiment string-for-string reproducibility is unsupported by design, but research integrity holds via Python overrides.

## S. Remaining Risks
- The current system heavily relies on `random` overrides. Developers should not introduce `random` module invocations without the explicit `self.rng` context.

## T. Recommended Next Phase
- Move forward to Phase 5A.9.

# PHASE 5A.12 FINAL CAMPAIGN DATASET INTEGRITY AUDIT

## 1. Campaign Configuration
- **Campaign**: FINAL_EXPERIMENT_CAMPAIGN
- **Base seed**: 42
- **Model**: qwen2.5:7b
- **Temperature**: 0.3
- **Expected Observations**: 2,400

## 2. File Count
- **Expected**: 2400
- **Actual count**: 2400 (`results/factorial_campaign/*.json`)

## 3. JSON Parsing Results
- **Total files**: 2400
- **Successfully parsed**: 2400
- **Failed parses**: 0
- **Failed filenames**: None

## 4. Required Field Coverage
- All 2,400 observations contain the required fields.
- **Missing fields**: 0

## 5. ID Uniqueness
- **experiment_id present**: Yes
- **experiment_id unique**: Yes (2400 unique IDs)
- **Duplicate experiment IDs**: None

## 6. Seed Uniqueness
- **Seed present**: Yes
- **Execution seeds unique across campaign**: Yes (600 unique execution seeds across 2400 observations, confirming exactly 600 simulator executions).
- **Duplicate seeds**: None across distinct executions.

## 7. Factorial Balance
- **Total unique cells**: 240
- **Observations per cell**: Exactly 10 (min: 10, max: 10)
- **Condition met**: Yes, no cell has fewer or more than 10 observations.

## 8. Pressure Balance
- **LOW**: 600
- **MEDIUM**: 600
- **HIGH**: 600
- **EXTREME**: 600
- **NORMAL**: 0

## 9. Role Balance
- **Backend Developer**: 600
- **Frontend Developer**: 600
- **QA Engineer**: 600
- **DevOps Engineer**: 600

## 10. Personality Balance
- **HONEST**: 480
- **OPTIMISTIC**: 480
- **RISK_AVERSE**: 480
- **AMBITIOUS**: 480
- **OPPORTUNISTIC**: 480

## 11. Difficulty Balance
- **EASY**: 800
- **MEDIUM**: 800
- **HARD**: 800

## 12. Metric Validity
- **Missing values / NaN / Infinity**: None found.
- **Unexpected data types**: None found.
- **Invalid records**: 0

## 13. Formula Consistency
- **deception_gap matches expected formula**: Yes
- **honesty_score, performance_score, stress_index deterministic consistency**: Yes (No mismatches found)
- **Mismatches**: 0

## 14. Deception Classification Consistency
- **Consistency with approved thresholds**: Yes
- **Mismatches**: 0

## 15. Auditor Integrity
- **auditor_score exists**: Yes
- **deception_detected exists**: Yes
- **Auditor numerical scoring consistency**: Yes
- **Auditor explanation usage issue**: No, numerical score is valid.

## 16. Provenance Coverage
- **Records with provenance**: 2400
- **Records without provenance**: 0
- **Missing Git SHA**: 0
- **Missing prompts**: 0
- **Missing raw outputs**: 0

## 17. Historical Dataset Protection
- **Historical records**: 211
- **File modified?**: No (confirmed via `git diff -- results/experiment_summary.csv`)

## 18. Combined Dataframe Validation
- **Rows**: 2400
- **Columns**: 29
- **Duplicate rows**: 0
- **Missing values**: 0

## 19. Git State
- `git status` shows new untracked files from the audit process, but no modifications to campaign or historical dataset files.
- `git diff --check` output is clean.
- `git diff -- results/experiment_summary.csv` output is clean.

## 20. Any Issues Found
- **OBSERVATION**: None. All integrity checks passed successfully.

---

**FINAL VERDICT:**
DATASET READY FOR STATISTICAL ANALYSIS

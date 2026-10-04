# Phase 5A.9A: Sampling Design Analysis

## Experimental Unit
By tracing the actual execution flow, it is clear that the experimental unit in the current system is **one developer observation inside a simulator run** (Option B).

- **Execution Trace**: 
  - `runner.run_all()` iterates over 4 `PressureLevel` options. For each, it executes `simulator.run(pressure)` `runs_per_pressure` times.
  - Inside `simulator.run()`, the system iterates over a list of 4 developers (`BackendAgent`, `FrontendAgent`, `QAAgent`, `DevOpsAgent`).
  - For each developer, a `Personality` and `TaskDifficulty` are selected using `rng.choice()`.
  - A single `ExperimentResult` record is instantiated, populated with the developer's specific task, strategy, progress, and performance, and saved to the results directory.
- **Result**: One `simulator.run()` produces exactly 4 developer-level `ExperimentResult` records.
- **Independence**: Developers are processed sequentially without sharing state or interacting within a run. Their decisions are based purely on the provided inputs (pressure, policy, assigned personality, task difficulty) and the deterministic seed behavior.

## Current Sampling Design (Candidate A)
- **Pressure Representation**: Explicitly iterated in `experiments/runner.py`.
- **Developer Role Representation**: Explicitly iterated in `simulation/simulator.py`.
- **Personality Representation**: Randomly sampled per developer in `simulator.run()`.
- **Task Difficulty Representation**: Randomly sampled per developer in `simulator.run()`.
- **Balance**: Unbalanced. The design guarantees equal observations for Pressure and Role, but the distribution of Personality and Task Difficulty depends entirely on random sampling variance. Some factorial cells may be empty, while others have multiple observations.

## Candidate Balanced Factorial Design (Candidate B)
- **Structure**: Covers all 240 combinations (4 Pressures × 4 Roles × 5 Personalities × 3 Task Difficulties).
- **Balance**: Perfectly balanced by definition.
- **Execution Flow Implications**: This would require modifying `simulator.run()` to accept `Personality` and `TaskDifficulty` as arguments instead of sampling them internally, and rewriting `runner.py` to iterate through the 240 combinations.

## Design Comparison

| Feature | Current Randomized Design | Balanced Factorial Design |
| :--- | :--- | :--- |
| **Balance** | Unbalanced for Personality & Difficulty | Perfectly balanced for all 4 factors |
| **Coverage** | Probabilistic (risk of empty cells) | Exhaustive (all 240 cells covered) |
| **Confounding Risk** | Low (randomization prevents systematic bias) | None (perfect orthogonality) |
| **Interpretation** | Main effects of Pressure & Role are clear; Interaction effects lack power | All main effects and interactions are easily interpretable and have equal power |
| **Computational Cost** | Scalable (4 × 4 × `runs_per_pressure` observations) | Fixed multiple of 240 (240 × $R$ observations) |
| **Current Storage Compatibility**| Fully compatible | Fully compatible (`ExperimentResult` captures all variables) |
| **Current Analytics Compatibility**| Requires handling unbalanced data | Supports standard ANOVA easily |
| **Seed Handling** | Sequential per `simulator.run()` (batch of 4) | Would require distinct seeds per cell replication |

## Repetition Analysis
If the factorial design is selected, the experiment will consist of $240 \times R$ observations.
- **What $R$ represents**: $R$ represents the number of independent replicates for the exact same combination of `(Pressure, Role, Personality, Difficulty)`.
- **What changing $R$ affects**: $R$ directly controls statistical power and precision for estimating within-cell variance caused by the LLM's non-deterministic behavior and the explicit probability distributions inside `agent.choose_strategy()`.
- **Independent Repetition Support**: Yes, the system supports this via the `seed` argument.
- **Seed Implications**: In a factorial design, the seed must systematically map to each specific replicate of a combination (e.g., `hash(combination) + r`) to guarantee reproducibility.
- **Information needed to choose $R$**: A power analysis based on the expected effect size. 

## Open Research Decisions
1. **Factorial vs. Randomized Choice**: Should the system be refactored to support the balanced factorial design, or remain as a randomized simulation of sprints?
2. **Sample Size ($R$)**: If factorial is chosen, what is the required number of repetitions ($R$) to achieve statistical significance?

## Recommendation
**RESEARCHER DECISION REQUIRED**

The current implementation strongly supports the randomized design (Candidate A) via `simulator.run()`. Transitioning to a balanced factorial design (Candidate B) requires modifying the execution flow in `simulator.py` and `runner.py` to decouple the sampling from the sprint simulation. Furthermore, the number of repetitions ($R$) cannot be chosen arbitrarily (e.g., 10 or 30) without a statistical power analysis. Both designs are fully compatible with the existing `ExperimentResult` schema, so no data model changes are required. The final decision rests on whether the research objective prioritizes exhaustive interaction analysis (favoring Candidate B) or simulation realism (favoring Candidate A).

# Phase 5A.10A: Factorial Execution Architecture Decision

## 1. Problem
The current simulator was designed for stochastic execution, selecting developer personality and task difficulty independently inside the simulator loop using `rng.choice()`.
For the frozen factorial design (Pressure × Developer Role × Personality × Task Difficulty = 4 × 4 × 5 × 3 = 240 cells, with 10 repetitions), this creates heterogeneous developer observations within one simulator execution.
We need a balanced factorial design without silently changing the research semantics (e.g. forcing all developers to have the same personality) or creating a massive number of wasted LLM calls.

## 2. Existing Architecture
- **Runner (`experiments/runner.py`)**: Iterates over pressure levels and calls `simulator.run()`.
- **Simulator (`simulation/simulator.py`)**: Instantiates 4 developers. Generates policy and sprint tasks. Loops over the 4 developers.
- **Assignment**: In the developer loop, `personality` and `difficulty` are randomly chosen using `rng.choice()`. The developer processes the task, an `ExperimentResult` is saved, and the next developer runs.
- **Interactions**: Developers do NOT interact. The manager assigns tasks independently. Developers generate progress and status updates independently. The only shared state is the sequential draws from the simulator's Random Number Generator (`self.rng`).

## 3. Existing Execution Semantics
The simulation models a 4-person software company sprint. Because personality and difficulty are assigned stochastically inside the loop, a typical simulator run features heterogeneous developers (e.g., an HONEST backend developer working alongside an AMBITIOUS frontend developer). This creates a diverse corporate environment.

## 4. Experimental-Unit Analysis
Because there is no state passed between developers and no interaction, each execution of a developer is functionally and statistically independent of the others, conditionally on the shared pressure and policy. 
Therefore, the **experimental unit is the developer observation**, nested inside a simulator run. One simulator execution validly produces 4 distinct, independent experimental units.

## 5. Option A: Per-Developer Factorial Control
- **Concept**: The runner pre-calculates the factorial conditions and supplies a complete mapping of `role -> (personality, difficulty)` to the simulator for each run. 
- **Implementation**: The simulator uses the provided dictionary instead of `rng.choice()`.
- **Execution**: To get 10 reps of 15 conditions (150 runs) per pressure, the runner shuffles 150 conditions for each of the 4 roles and zips them together into 150 runs.
- **Viability**: Highly viable. It produces exactly the target design. Since conditions are shuffled independently per role, the company remains heterogeneous, perfectly preserving existing semantics.

## 6. Option B: Single-Developer Factorial Execution
- **Concept**: Execute only one developer observation per simulator run.
- **Viability**: Poor. Requires modifying the simulator to only process one role per run, changing the semantics from a "4-person team" to a "1-person team". It requires 2400 simulator executions. 

## 7. Option C: Factorial Target + Heterogeneous Companion Developers
- **Concept**: One target developer gets explicit factorial conditions; the other 3 get random assignments.
- **Viability**: Rejected. Requires 2400 simulator executions, generating 2400 targets and 7200 discarded/companion observations. This equates to ~19,200 LLM calls, which is extremely costly and unnecessary since developers do not interact.

## 8. Option D: Homogeneous Condition Per Run
- **Concept**: All 4 developers receive the exact same personality and difficulty in a single run.
- **Viability**: Rejected. While it takes 600 runs, it completely alters the intended semantics by creating a monolithic, homogeneous company culture, eliminating the diversity present in the original stochastic design.

## 9. Execution-Count Comparison
| Architecture | Simulator Executions | Developer Observations | Target Observations | Est. LLM Calls |
| :--- | :--- | :--- | :--- | :--- |
| **Original Stochastic** | 600 | 2400 | N/A | ~4800 |
| **Option A (Recommended)** | 600 | 2400 | 2400 | ~4800 |
| **Option B** | 2400 | 2400 | 2400 | ~4800 |
| **Option C** | 2400 | 9600 | 2400 | ~19200 |
| **Option D** | 600 | 2400 | 2400 | ~4800 |

## 10. Seed Implications
The existing simulator passes a shared RNG down to all agents. Under Option A, the random choices for personality and difficulty are replaced by deterministic assignments, but the RNG is still used for inner variations (like `bugs_introduced`).
Because developers are executed sequentially, the RNG draws remain perfectly deterministic given a base seed.
**Strategy**: Use an integer `seed = base_seed + run_index` at the runner level. This prevents Python string hashing issues and ensures perfectly reproducible sequences.

## 11. Metadata Requirements
The existing `ExperimentResult` model already captures:
- `pressure`
- `developer_role`
- `personality`
- `task_difficulty`
- `seed`
- `experiment_id` (unique per developer observation)
This is entirely sufficient to identify each of the 240 cells. The 10 repetitions can be implicitly grouped by these fields. No new database fields are required, satisfying the requirement to avoid automatically adding fields. Adding a `simulator_run_id` is optional but not required.

## 12. Statistical Implications
- **Independence**: Developer observations remain statistically independent. The inputs are orthogonal by design.
- **Clustering**: Observations are clustered in batches of 4 by simulator run, sharing the same `Pressure`. Since `Pressure` is an explicit fixed effect, this does not introduce unobserved confounding.
- **Interaction**: The factorial design is fully crossed and balanced, allowing clear interpretation of interactions (e.g. Pressure x Personality).
- **Variance**: 10 repetitions per cell provide sufficient degrees of freedom to estimate within-cell variance.

## 13. Recommended Architecture
**Option A: Per-Developer Factorial Control** is the recommended architecture. It fulfills all requirements, preserves the company heterogeneity, guarantees exact factorial balance, and requires zero wasted LLM calls.

## 14. Exact Implementation Requirements
1. **Runner (`experiments/runner.py`)**: 
   - Generate factorial combinations: For each pressure (4), create a list of 150 combinations (15 factor levels x 10 reps) for each of the 4 roles.
   - Shuffle each role's list independently (using a seeded PRNG) to maintain heterogeneity.
   - Zip them into 150 simulator run configurations per pressure.
   - Pass `developer_conditions` (a dict mapping role to `(personality, difficulty)`) to `simulator.run()`.
2. **Simulator (`simulation/simulator.py`)**:
   - Update `run()` signature to accept `developer_conditions=None`.
   - In the developer loop, check if `developer_conditions` is provided. If so, use it; otherwise fallback to `rng.choice()`.

## 15. Research Risks
- **RNG Coupling**: Because the 4 developers share the simulator RNG, their internal random variations are technically coupled in sequence. However, this poses no risk to statistical validity because the PRNG provides pseudo-independence, and there is no causal interaction between agents.

## 16. Open Decisions
- Should a `simulator_run_id` be added to explicitly link the 4 developers from the same run for provenance purposes, or is the shared `timestamp`/`seed` sufficient? (Recommendation: `timestamp`/`seed` is sufficient).
- Should the runner shuffling seed be identical to the simulation `base_seed`, or separate to allow different assignment pairings?

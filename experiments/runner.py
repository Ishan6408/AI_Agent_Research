import time

from simulation.simulator import SoftwareCompanySimulator
from models.environment import PressureLevel


class ExperimentRunner:

    def __init__(self, runs_per_pressure=10, storage_dir="results"):

        self.runs_per_pressure = runs_per_pressure
        self.storage_dir = storage_dir
        self.simulator = SoftwareCompanySimulator(storage_dir=storage_dir)

    # -------------------------------------------------------
    # Run All Pressure Levels
    # -------------------------------------------------------

    def run_all(self, base_seed=None):

        pressures = [
            PressureLevel.LOW,
            PressureLevel.MEDIUM,
            PressureLevel.HIGH,
            PressureLevel.EXTREME
        ]

        total_experiments = (
            len(pressures) * self.runs_per_pressure
        )

        completed = 0
        results = []

        start_time = time.time()

        print("\n" + "=" * 70)
        print("AI AGENT RESEARCH EXPERIMENTS")
        print("=" * 70)
        print(f"Runs Per Pressure : {self.runs_per_pressure}")
        print(f"Total Experiments : {total_experiments}")
        print("=" * 70)

        for pressure in pressures:

            print("\n" + "=" * 70)
            print(f"Pressure Level : {pressure.value}")
            print("=" * 70)

            for run in range(self.runs_per_pressure):

                current_seed = base_seed + completed if base_seed is not None else None

                completed += 1

                print(
                    f"\nExperiment "
                    f"{run + 1}/{self.runs_per_pressure}"
                )

                print(
                    f"Overall Progress : "
                    f"{completed}/{total_experiments}"
                )

                batch_results = self.simulator.run(
                    pressure=pressure,
                    seed=current_seed
                )
                results.extend(batch_results)

        elapsed = time.time() - start_time

        print("\n" + "=" * 70)
        print("ALL EXPERIMENTS COMPLETED")
        print("=" * 70)
        print(f"Total Experiments : {total_experiments}")
        print(f"Execution Time    : {elapsed:.2f} seconds")
        print("=" * 70)

        return results

    # -------------------------------------------------------
    # Run Single Pressure Level
    # -------------------------------------------------------

    def run_pressure(self, pressure, base_seed=None):
        results = []

        print("\n" + "=" * 70)
        print(f"Running {pressure.value} Pressure Experiments")
        print("=" * 70)

        for i in range(self.runs_per_pressure):

            current_seed = base_seed + i if base_seed is not None else None

            print(
                f"\nExperiment "
                f"{i + 1}/{self.runs_per_pressure}"
            )

            batch_results = self.simulator.run(
                pressure=pressure,
                seed=current_seed
            )
            results.extend(batch_results)

        return results

    # -------------------------------------------------------
    # Factorial Matrix Generation
    # -------------------------------------------------------

    def generate_factorial_executions(self, base_seed=42):
        from models.personality import Personality
        from models.task_difficulty import TaskDifficulty
        import random

        pressures = [
            PressureLevel.LOW,
            PressureLevel.MEDIUM,
            PressureLevel.HIGH,
            PressureLevel.EXTREME
        ]

        personalities = list(Personality)
        difficulties = list(TaskDifficulty)
        roles = ["Backend Developer", "Frontend Developer", "QA Engineer", "DevOps Engineer"]

        reps = 10
        executions = []
        execution_index = 0

        for pressure_idx, pressure in enumerate(pressures):
            role_conditions = {}
            for role_idx, role in enumerate(roles):
                conds = []
                for p in personalities:
                    for d in difficulties:
                        for _ in range(reps):
                            conds.append({"personality": p, "difficulty": d})

                # Deterministically shuffle this role's conditions
                # Different seed for each role so they don't get exactly the same conditions in lockstep
                shuffle_seed = base_seed + (pressure_idx * 100) + role_idx
                rng = random.Random(shuffle_seed)
                rng.shuffle(conds)
                role_conditions[role] = conds

            # Each role has len(personalities) * len(difficulties) * reps = 5 * 3 * 10 = 150 conditions
            # Pair them up into simulator executions
            num_executions_per_pressure = len(personalities) * len(difficulties) * reps
            for i in range(num_executions_per_pressure):
                exec_seed = base_seed + execution_index
                dev_conds = {
                    role: role_conditions[role][i]
                    for role in roles
                }
                executions.append({
                    "pressure": pressure,
                    "seed": exec_seed,
                    "developer_conditions": dev_conds
                })
                execution_index += 1

        return executions

    # -------------------------------------------------------
    # Run Factorial Matrix
    # -------------------------------------------------------

    def run_factorial(self, base_seed=42):
        import os
        original_storage_dir = self.simulator.storage_dir
        self.simulator.storage_dir = os.path.join(original_storage_dir, "factorial_campaign")

        try:
            executions = self.generate_factorial_executions(base_seed=base_seed)
            total_experiments = len(executions)

            results = []
            completed = 0
            start_time = time.time()

            print("\n" + "=" * 70)
            print("FACTORIAL AI AGENT RESEARCH EXPERIMENTS")
            print("=" * 70)
            print(f"Total Simulator Executions : {total_experiments}")
            print("=" * 70)

            for exec_data in executions:
                completed += 1
                pressure = exec_data["pressure"]
                seed = exec_data["seed"]
                dev_conds = exec_data["developer_conditions"]

                print(f"\nExecution {completed}/{total_experiments} | Pressure: {pressure.value} | Seed: {seed}")

                batch_results = self.simulator.run(
                    pressure=pressure,
                    seed=seed,
                    developer_conditions=dev_conds
                )
                results.extend(batch_results)

            elapsed = time.time() - start_time
            print("\n" + "=" * 70)
            print("ALL FACTORIAL EXPERIMENTS COMPLETED")
            print("=" * 70)
            print(f"Total Executions  : {total_experiments}")
            print(f"Execution Time    : {elapsed:.2f} seconds")
            print("=" * 70)

        finally:
            self.simulator.storage_dir = original_storage_dir

        return results

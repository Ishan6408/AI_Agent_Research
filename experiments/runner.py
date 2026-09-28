import time

from simulation.simulator import SoftwareCompanySimulator
from models.environment import PressureLevel


class ExperimentRunner:

    def __init__(self, runs_per_pressure=10):

        self.runs_per_pressure = runs_per_pressure
        self.simulator = SoftwareCompanySimulator()

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

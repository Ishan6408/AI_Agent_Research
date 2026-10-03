from experiments.runner import ExperimentRunner

def main():

    runner = ExperimentRunner(
        runs_per_pressure=10 
        )

    runner.run_all()


if __name__ == "__main__":
    main()
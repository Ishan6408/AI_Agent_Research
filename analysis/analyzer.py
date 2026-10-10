import json
from pathlib import Path

import pandas as pd


class ExperimentAnalyzer:

    def __init__(self, results_folder="results"):

        self.results_folder = Path(results_folder)



    # -------------------------------------------------------
    # Load Experiments
    # -------------------------------------------------------

    def load_experiments(self):
        """Load experiments from JSON files, falling back to CSV if none exist."""

        experiments = []

        if not self.results_folder.exists():

            print(
                f"Results folder '{self.results_folder}' not found."
            )

            return experiments


        json_files = sorted(
            [f for f in self.results_folder.rglob("*.json") if f.name.startswith("experiment_")]
        )


        for file in json_files:

            try:

                with open(
                    file,
                    "r",
                    encoding="utf-8"
                ) as f:

                    content = f.read().strip()


                    if not content:

                        continue


                    experiments.append(
                        json.loads(content)
                    )


            except Exception as e:

                print(
                    f"Skipping {file.name}: {e}"
                )


        # -------------------------------------------------------
        # CSV fallback
        # When no JSON files exist (data was pre-generated and
        # saved only as experiment_summary.csv), load from CSV so
        # the API can serve the existing dataset without running
        # new experiments.  No analysis logic is changed here.
        # -------------------------------------------------------

        if not experiments:

            csv_path = self.results_folder / "experiment_summary.csv"

            if csv_path.exists():

                try:

                    csv_df = pd.read_csv(csv_path)

                    # Normalise deception_detected from CSV string
                    # representation back to Python booleans so
                    # downstream code behaves consistently.
                    if "deception_detected" in csv_df.columns:
                        csv_df["deception_detected"] = (
                            csv_df["deception_detected"]
                            .astype(str)
                            .str.strip()
                            .str.lower()
                            .map({"true": True, "false": False})
                            .fillna(False)
                            .astype(bool)
                        )

                    experiments = csv_df.to_dict(orient="records")

                    print(
                        f"No JSON files found. "
                        f"Loaded {len(experiments)} experiments from CSV."
                    )

                except Exception as e:

                    print(
                        f"Could not load CSV fallback: {e}"
                    )

        return experiments



    # -------------------------------------------------------
    # Create DataFrame
    # -------------------------------------------------------

    def create_dataframe(self):

        experiments = self.load_experiments()


        if not experiments:

            return None


        return pd.DataFrame(experiments)



    # -------------------------------------------------------
    # Save Raw CSV
    # -------------------------------------------------------

    def save_csv(self):

        df = self.create_dataframe()


        if df is None:

            return None


        output = (
            self.results_folder /
            "experiment_summary.csv"
        )


        df.to_csv(
            output,
            index=False
        )


        print(
            f"\nCSV saved: {output}"
        )


        return df



    # -------------------------------------------------------
    # Main Summary
    # -------------------------------------------------------

    def print_summary(self, df):

        self.section(
            "EXPERIMENT SUMMARY"
        )


        print(
            f"Total Experiments : {len(df)}"
        )


        metrics = {

            "actual_progress":
                "Average Actual Progress",

            "reported_progress":
                "Average Reported Progress",

            "deception_gap":
                "Average Deception Gap",

            "bugs_introduced":
                "Average Bugs",

            "code_quality":
                "Average Code Quality",

            "honesty_score":
                "Average Honesty",

            "stress_index":
                "Average Stress",

            "performance_score":
                "Average Performance",

            "auditor_score":
                "Average Auditor Score"

        }


        for col, name in metrics.items():

            self.print_if_exists(
                df,
                col,
                name
            )



        if "deception_detected" in df.columns:

            print(
                f"Detection Rate : "
                f"{df['deception_detected'].mean()*100:.2f}%"
            )



        self.generate_reports(df)



    # -------------------------------------------------------
    # Research Reports
    # -------------------------------------------------------

    def generate_reports(self, df):


        # -------------------------------
        # Correlation Matrix
        # -------------------------------

        self.section(
            "CORRELATION MATRIX"
        )


        numeric = df.select_dtypes(
            include="number"
        )


        correlation = (
            numeric.corr()
            .round(2)
        )


        print(correlation)


        correlation.to_csv(
            self.results_folder /
            "correlation_matrix.csv"
        )



        # -------------------------------
        # Suspicious Experiments
        # -------------------------------

        if "deception_gap" in df.columns:


            suspicious = (
                df.sort_values(
                    "deception_gap",
                    ascending=False
                )
                .head(10)
            )


            self.section(
                "TOP 10 SUSPICIOUS EXPERIMENTS"
            )


            print(
                suspicious
            )


            suspicious.to_csv(
                self.results_folder /
                "top_suspicious_experiments.csv",
                index=False
            )



        # -------------------------------
        # Group Reports
        # -------------------------------

        self.create_group_summary(
            df,
            "pressure"
        )


        self.create_group_summary(
            df,
            "personality"
        )


        self.create_group_summary(
            df,
            "task_difficulty"
        )


        self.create_group_summary(
            df,
            "developer_role"
        )



        # -------------------------------
        # Developer × Pressure
        # -------------------------------

        if (
            "developer_role" in df.columns
            and
            "pressure" in df.columns
        ):

            table = (
                df.groupby(
                    [
                        "developer_role",
                        "pressure"
                    ]
                )
                .agg({

                    "deception_gap":"mean",

                    "bugs_introduced":"mean",

                    "code_quality":"mean",

                    "performance_score":"mean"

                })
                .round(2)
            )


            self.section(
                "DEVELOPER × PRESSURE ANALYSIS"
            )


            print(table)


            table.to_csv(
                self.results_folder /
                "developer_pressure_analysis.csv"
            )



        # -------------------------------
        # Personality × Difficulty
        # -------------------------------

        if (
            "personality" in df.columns
            and
            "task_difficulty" in df.columns
        ):


            table = (
                df.groupby(
                    [
                        "personality",
                        "task_difficulty"
                    ]
                )
                .agg({

                    "deception_gap":"mean",

                    "performance_score":"mean",

                    "honesty_score":"mean"

                })
                .round(2)
            )


            self.section(
                "PERSONALITY × DIFFICULTY ANALYSIS"
            )


            print(table)


            table.to_csv(
                self.results_folder /
                "personality_difficulty_analysis.csv"
            )



        self.identify_patterns(df)



    # -------------------------------------------------------
    # Pattern Detection
    # -------------------------------------------------------

    def identify_patterns(self, df):


        self.section(
            "RESEARCH FINDINGS"
        )


        if "personality" in df.columns:


            result = (
                df.groupby("personality")
                ["deception_gap"]
                .mean()
                .sort_values(
                    ascending=False
                )
            )


            print(
                "\nMost Deceptive Personality:"
            )

            print(
                result.head(1)
            )



        if "developer_role" in df.columns:


            result = (
                df.groupby("developer_role")
                ["deception_gap"]
                .mean()
                .sort_values(
                    ascending=False
                )
            )


            print(
                "\nMost Deceptive Developer Role:"
            )


            print(
                result.head(1)
            )



        if "pressure" in df.columns:


            result = (
                df.groupby("pressure")
                ["deception_gap"]
                .mean()
                .sort_values(
                    ascending=False
                )
            )


            print(
                "\nMost Difficult Pressure Level:"
            )


            print(
                result.head(1)
            )



    # -------------------------------------------------------
    # Group Summary Export
    # -------------------------------------------------------

    def create_group_summary(
            self,
            df,
            column
    ):


        if column not in df.columns:

            return


        summary = (
            df.groupby(column)
            .mean(
                numeric_only=True
            )
            .round(2)
        )


        print(
            "\n",
            column.upper(),
            "SUMMARY"
        )

        print(summary)


        summary.to_csv(
            self.results_folder /
            f"{column}_summary.csv"
        )



    # -------------------------------------------------------
    # Helpers
    # -------------------------------------------------------

    def section(self, title):

        print(
            "\n" +
            "=" * 60
        )

        print(title)

        print(
            "=" * 60
        )



    def print_if_exists(
            self,
            df,
            column,
            label
    ):


        if column in df.columns:

            print(
                f"{label:<30}: "
                f"{df[column].mean():.2f}"
            )



# -------------------------------------------------------
# MAIN
# -------------------------------------------------------

def main():

    analyzer = ExperimentAnalyzer()


    df = analyzer.save_csv()


    if df is not None:

        analyzer.print_summary(df)



if __name__ == "__main__":

    main()
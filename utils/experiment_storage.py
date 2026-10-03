import json
import os
from datetime import datetime


def save_experiment(result):

    os.makedirs("results", exist_ok=True)

    experiment_id = f"experiment_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    filename = f"results/{experiment_id}.json"

    with open(filename, "w") as file:
        json.dump(
            result.model_dump(),
            file,
            indent=4
        )

    return experiment_id

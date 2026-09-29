import json
import os
from datetime import datetime


def save_experiment(result, storage_dir="results"):

    os.makedirs(storage_dir, exist_ok=True)

    if result.experiment_id:
        experiment_id = result.experiment_id
    else:
        import uuid
        experiment_id = f"experiment_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"

    filename = os.path.join(storage_dir, f"{experiment_id}.json")

    with open(filename, "w", encoding="utf-8") as file:
        json.dump(
            result.model_dump(),
            file,
            indent=4
        )

    return experiment_id

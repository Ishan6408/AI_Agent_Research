import os
import json
import pytest
from fastapi import HTTPException
from backend.services import experiment_service
from backend.services.experiment_service import get_all_experiments, get_experiment_by_id

@pytest.fixture
def setup_test_results(tmp_path, monkeypatch):
    # Override RESULTS_DIR
    monkeypatch.setattr(experiment_service, "RESULTS_DIR", str(tmp_path))
    
    # Create some mock files
    # 1. Root level normal
    root_file = tmp_path / "experiment_root.json"
    root_file.write_text(json.dumps({"id": "experiment_root", "value": 1}))
    
    # 2. Nested file
    nested_dir = tmp_path / "factorial_campaign"
    nested_dir.mkdir()
    nested_file = nested_dir / "experiment_nested.json"
    nested_file.write_text(json.dumps({"id": "experiment_nested", "value": 2}))
    
    # 3. Duplicate (same ID in another nested dir)
    duplicate_dir = tmp_path / "duplicate"
    duplicate_dir.mkdir()
    duplicate_file = duplicate_dir / "experiment_nested.json"
    duplicate_file.write_text(json.dumps({"id": "experiment_nested", "value": 3}))
    
    # 4. Malformed JSON
    malformed_file = tmp_path / "experiment_malformed.json"
    malformed_file.write_text("{ invalid json }")
    
    # 5. Non-experiment file
    non_exp_file = tmp_path / "something_else.json"
    non_exp_file.write_text(json.dumps({"id": "not_an_experiment"}))

    return tmp_path

def test_get_all_experiments(setup_test_results):
    experiments = get_all_experiments()
    
    # We expect 2 unique valid experiments ("experiment_root", "experiment_nested")
    # "experiment_malformed" is skipped
    # "something_else.json" is skipped (doesn't start with experiment_)
    # the duplicate "experiment_nested" should only be returned once
    
    assert len(experiments) == 2
    ids = [e["id"] for e in experiments]
    assert "experiment_root" in ids
    assert "experiment_nested" in ids
    assert "not_an_experiment" not in ids

def test_get_experiment_by_id_root(setup_test_results):
    data = get_experiment_by_id("experiment_root")
    assert data["value"] == 1

def test_get_experiment_by_id_nested(setup_test_results):
    data = get_experiment_by_id("experiment_nested")
    # It will find one of the duplicates, either value 2 or 3
    assert data["value"] in [2, 3]

def test_get_experiment_by_id_not_found(setup_test_results):
    with pytest.raises(HTTPException) as exc:
        get_experiment_by_id("experiment_missing")
    assert exc.value.status_code == 404

def test_get_experiment_by_id_malformed(setup_test_results):
    with pytest.raises(HTTPException) as exc:
        get_experiment_by_id("experiment_malformed")
    assert exc.value.status_code == 500

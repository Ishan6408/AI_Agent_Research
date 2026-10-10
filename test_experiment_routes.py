import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_run_experiment_valid_pressure():
    # We will mock the service so it doesn't actually run anything
    with pytest.MonkeyPatch.context() as m:
        m.setattr("backend.services.experiment_service.run_experiment", lambda p, s: {"success": True, "experiment_id": "test", "result": {}, "experiments": []})
        response = client.post("/api/experiments/run", json={"pressure": "HIGH"})
        assert response.status_code == 200
        assert response.json()["success"] is True

def test_run_experiment_invalid_pressure():
    response = client.post("/api/experiments/run", json={"pressure": "SUPER_HIGH"})
    assert response.status_code == 422
    assert "Input should be" in response.json()["detail"][0]["msg"]

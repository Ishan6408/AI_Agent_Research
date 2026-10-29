import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_run_experiment_valid_pressure():
    # We will mock the service so it doesn't actually run anything
    with pytest.MonkeyPatch.context() as m:
        m.setattr("backend.services.experiment_service.run_experiment", lambda p, s=None: {"success": True, "experiment_id": "test", "result": {}, "experiments": []})
        response = client.post("/api/experiments/run", json={"pressure": "HIGH"}, headers={"Idempotency-Key": "compat-key-001"})
        assert response.status_code == 200
        assert response.json()["success"] is True

def test_run_experiment_invalid_pressure():
    # Pass a valid key so body validation (not header validation) determines the response
    response = client.post("/api/experiments/run", json={"pressure": "SUPER_HIGH"}, headers={"Idempotency-Key": "compat-key-002"})
    assert response.status_code == 422
    assert "Input should be" in response.json()["detail"][0]["msg"]

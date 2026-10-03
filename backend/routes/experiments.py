from fastapi import APIRouter
from backend.services import experiment_service
from backend.schemas.experiment import RunPressureRequest, RunAllRequest, RunExperimentRequest

router = APIRouter()

@router.get("/")
def list_experiments():
    return experiment_service.get_all_experiments()

@router.get("/{experiment_id}")
def get_experiment(experiment_id: str):
    return experiment_service.get_experiment_by_id(experiment_id)

@router.post("/run")
def run_experiment(req: RunExperimentRequest):
    return experiment_service.run_experiment(req.pressure)

@router.post("/run-pressure")
def run_pressure(req: RunPressureRequest):
    return experiment_service.run_pressure_experiments(req.pressure, req.runs)

@router.post("/run-all")
def run_all(req: RunAllRequest):
    return experiment_service.run_all_experiments(req.runs)

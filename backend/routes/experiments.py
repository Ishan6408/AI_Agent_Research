from fastapi import APIRouter
from backend.services import experiment_service
from backend.schemas.experiment import RunPressureRequest, RunAllRequest, RunExperimentRequest, RunExperimentResponse, RunBatchResponse

router = APIRouter()

@router.get("/")
def list_experiments():
    return experiment_service.get_all_experiments()

@router.get("/{experiment_id}")
def get_experiment(experiment_id: str):
    return experiment_service.get_experiment_by_id(experiment_id)

@router.post("/run", response_model=RunExperimentResponse)
def run_experiment(req: RunExperimentRequest):
    return experiment_service.run_experiment(req.pressure, req.base_seed)

@router.post("/run-pressure", response_model=RunBatchResponse)
def run_pressure(req: RunPressureRequest):
    return experiment_service.run_pressure_experiments(req.pressure, req.runs, req.base_seed)

@router.post("/run-all", response_model=RunBatchResponse)
def run_all(req: RunAllRequest):
    return experiment_service.run_all_experiments(req.runs, req.base_seed)

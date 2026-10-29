from fastapi import APIRouter, Depends
from backend.services import experiment_service
from backend.schemas.experiment import (
    RunPressureRequest, RunAllRequest, RunExperimentRequest,
    RunExperimentResponse, RunBatchResponse,
)
from backend.core.idempotency import idempotency_store, _require_idempotency_key

router = APIRouter()


@router.get("/")
def list_experiments(limit: int | None = None, offset: int = 0):
    return experiment_service.get_all_experiments(limit=limit, offset=offset)


@router.get("/{experiment_id}")
def get_experiment(experiment_id: str):
    return experiment_service.get_experiment_by_id(experiment_id)


@router.post("/run", response_model=RunExperimentResponse)
def run_experiment(
    req: RunExperimentRequest,
    idempotency_key: str = Depends(_require_idempotency_key),
):
    return idempotency_store.run_idempotent(
        key=idempotency_key,
        endpoint="/experiments/run",
        payload=req.model_dump(mode="json"),
        action=lambda: experiment_service.run_experiment(req.pressure, req.base_seed),
    )


@router.post("/run-pressure", response_model=RunBatchResponse)
def run_pressure(
    req: RunPressureRequest,
    idempotency_key: str = Depends(_require_idempotency_key),
):
    return idempotency_store.run_idempotent(
        key=idempotency_key,
        endpoint="/experiments/run-pressure",
        payload=req.model_dump(mode="json"),
        action=lambda: experiment_service.run_pressure_experiments(req.pressure, req.runs, req.base_seed),
    )


@router.post("/run-all", response_model=RunBatchResponse)
def run_all(
    req: RunAllRequest,
    idempotency_key: str = Depends(_require_idempotency_key),
):
    return idempotency_store.run_idempotent(
        key=idempotency_key,
        endpoint="/experiments/run-all",
        payload=req.model_dump(mode="json"),
        action=lambda: experiment_service.run_all_experiments(req.runs, req.base_seed),
    )

from fastapi import APIRouter
from backend.services import auditor_service
from typing import Dict, Any

router = APIRouter()

@router.get("/results")
def get_auditor_results():
    return auditor_service.get_results()

@router.post("/audit")
def audit_experiment(experiment: Dict[str, Any]):
    return auditor_service.audit_experiment(experiment)

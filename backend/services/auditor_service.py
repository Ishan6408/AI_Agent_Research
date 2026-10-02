from fastapi import HTTPException
from agents.auditor import AuditorAgent
from models.experiment import ExperimentResult
from backend.services.analytics_service import get_auditor_analysis

def get_results():
    return get_auditor_analysis()

def audit_experiment(experiment: dict):
    # Try to parse into ExperimentResult
    try:
        exp_obj = ExperimentResult(**experiment)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid experiment data: {str(e)}")
        
    auditor = AuditorAgent()
    return auditor.audit_experiment(exp_obj)

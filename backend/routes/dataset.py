from fastapi import APIRouter, Query
from typing import Optional
from backend.services import dataset_service

router = APIRouter()

@router.get("/")
def get_dataset(
    pressure: Optional[str] = Query(None),
    developer_role: Optional[str] = Query(None),
    personality: Optional[str] = Query(None),
    task_difficulty: Optional[str] = Query(None),
    behavior_strategy: Optional[str] = Query(None),
    deception_level: Optional[str] = Query(None),
    deception_detected: Optional[bool] = Query(None),
):
    filters = {
        "pressure": pressure,
        "developer_role": developer_role,
        "personality": personality,
        "task_difficulty": task_difficulty,
        "behavior_strategy": behavior_strategy,
        "deception_level": deception_level,
        "deception_detected": deception_detected,
    }
    # Remove None values
    filters = {k: v for k, v in filters.items() if v is not None}
    
    return dataset_service.get_dataset(filters)

@router.get("/summary")
def get_summary():
    return dataset_service.get_dataset_summary()

@router.get("/export")
def export_dataset():
    return dataset_service.export_dataset()

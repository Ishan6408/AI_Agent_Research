from fastapi import APIRouter
from backend.services import analytics_service

router = APIRouter()


@router.get("/overview")
def get_overview():
    return analytics_service.get_overview()


@router.get("/pressure")
def get_pressure():
    return analytics_service.get_group_analysis("pressure")


@router.get("/personality")
def get_personality():
    return analytics_service.get_group_analysis("personality")


@router.get("/developers")
def get_developers():
    return analytics_service.get_group_analysis("developer_role")


@router.get("/behavior")
def get_behavior():
    return analytics_service.get_group_analysis("behavior_strategy")


@router.get("/correlation")
def get_correlation():
    return analytics_service.get_correlation()


@router.get("/suspicious")
def get_suspicious():
    return analytics_service.get_suspicious()


@router.get("/auditor")
def get_auditor():
    return analytics_service.get_auditor_analysis()


@router.get("/research-findings")
def get_research_findings():
    return analytics_service.get_research_findings()

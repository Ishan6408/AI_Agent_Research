from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.routes import experiments, agents, analytics, dataset, auditor

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin")
    headers = {}
    if origin in settings.CORS_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Access-Control-Allow-Methods"] = "*"
        headers["Access-Control-Allow-Headers"] = "*"
    
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error: " + str(exc)},
        headers=headers
    )

@app.get(f"{settings.API_V1_STR}/health")
async def health_check():
    return {"status": "ok"}

app.include_router(experiments.router, prefix=f"{settings.API_V1_STR}/experiments", tags=["experiments"])
app.include_router(dataset.router, prefix=f"{settings.API_V1_STR}/dataset", tags=["dataset"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])
app.include_router(agents.router, prefix=f"{settings.API_V1_STR}/agents", tags=["agents"])
app.include_router(auditor.router, prefix=f"{settings.API_V1_STR}/auditor", tags=["auditor"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

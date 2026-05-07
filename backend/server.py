from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional, Any
import uuid
from datetime import datetime, timezone

from inference import (
    predict as run_inference,
    CLASS_NAMES,
    CLASS_PRECISION,
    MODEL_VERSION,
    get_model,
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Yam Leaf Disease Detector API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


# -------------------- Models --------------------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class StatusCheckCreate(BaseModel):
    client_name: str


class PredictionResponse(BaseModel):
    id: str
    predicted_class: str
    status_color: str
    confidence: float
    precision: float
    severity: float
    leaf_health_score: float
    description: str
    recommendation: str
    probabilities: Dict[str, float]
    bounding_box: Optional[Dict[str, float]] = None
    model_version: str
    inferred_at: str


# -------------------- Routes --------------------
@api_router.get("/")
async def root():
    return {"message": "Yam Leaf Disease Detector API"}


@api_router.get("/model/info")
async def model_info() -> Dict[str, Any]:
    """Expose model metadata so the UI can show class names + precision."""
    return {
        "model_version": MODEL_VERSION,
        "class_names": CLASS_NAMES,
        "class_precision": {
            k: round(v * 100.0, 1) for k, v in CLASS_PRECISION.items()
        },
        "input_size": [224, 224, 3],
    }


@api_router.post("/predict", response_model=PredictionResponse)
async def predict_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty file")
    try:
        result = run_inference(image_bytes)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.exception("Inference failed")
        raise HTTPException(status_code=500, detail=f"Inference error: {exc}")

    response = {
        "id": str(uuid.uuid4()),
        **result,
        "inferred_at": datetime.now(timezone.utc).isoformat(),
    }

    # Persist a lightweight log (no image bytes).
    try:
        await db.predictions.insert_one(
            {
                **{k: v for k, v in response.items() if k != "_id"},
                "filename": file.filename,
            }
        )
    except Exception:
        logger.warning("Could not persist prediction to MongoDB")

    return response


@api_router.get("/predictions")
async def list_predictions(limit: int = 20):
    docs = (
        await db.predictions.find({}, {"_id": 0})
        .sort("inferred_at", -1)
        .to_list(limit)
    )
    return docs


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check["timestamp"], str):
            check["timestamp"] = datetime.fromisoformat(check["timestamp"])
    return status_checks


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def warmup_model():
    try:
        get_model()
        logger.info("Yam-leaf model warmed up successfully")
    except Exception as exc:
        logger.error("Model warmup failed: %s", exc)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

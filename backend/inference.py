"""
Yam Leaf Disease Classifier — TensorFlow/Keras inference service.

Loads a fine-tuned MobileNetV2 model (.keras) once at import and exposes
`predict(image_bytes)` returning a structured detection result.

Class indices match the order in CLASS_NAMES (configurable via env). For
MobileNetV2 trained with the standard preprocessing, inputs are scaled to
[-1, 1] using `mobilenet_v2.preprocess_input`.
"""

from __future__ import annotations

import io
import logging
import os
from pathlib import Path
from typing import List, Optional

import numpy as np
from PIL import Image, ImageOps

# Defer TF import errors until first use so the API can still start.
try:
    import tensorflow as tf
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
except Exception as exc:  # pragma: no cover
    tf = None
    preprocess_input = None
    _IMPORT_ERROR = exc
else:
    _IMPORT_ERROR = None

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

ROOT_DIR = Path(__file__).parent
MODEL_DIR = ROOT_DIR / "models"

CLASS_NAMES: List[str] = [
    c.strip()
    for c in os.environ.get(
        "YAM_CLASS_NAMES",
        "Healthy,Anthracnose,Virus Infected",
    ).split(",")
    if c.strip()
]

# Per-class precision metric placeholders (configurable). The user noted
# precision is an evaluation metric, not a per-image prediction. Override via
# env var YAM_CLASS_PRECISION="0.94,0.91,0.88" once true eval values are known.
_default_precision = {
    "Healthy": 0.94,
    "Anthracnose": 0.91,
    "Virus Infected": 0.89,
}
if os.environ.get("YAM_CLASS_PRECISION"):
    try:
        vals = [float(v) for v in os.environ["YAM_CLASS_PRECISION"].split(",")]
        CLASS_PRECISION = dict(zip(CLASS_NAMES, vals))
    except Exception:
        CLASS_PRECISION = _default_precision
else:
    CLASS_PRECISION = _default_precision

MODEL_FILENAME = os.environ.get(
    "YAM_MODEL_FILE", "MobileNetV2_Hardened_Final.keras"
)
MODEL_VERSION = os.environ.get(
    "YAM_MODEL_VERSION", "yam-leaf-mobilenetv2-hardened-v1"
)

# ---------------------------------------------------------------------------
# Domain knowledge — copy that surfaces in the result panel.
# ---------------------------------------------------------------------------

CLASS_INFO = {
    "Healthy": {
        "color": "emerald",
        "description": (
            "Leaf surface appears uniformly pigmented with no visible "
            "chlorotic or necrotic regions. Vascular patterns look intact "
            "and margins are clean."
        ),
        "recommendation": (
            "No intervention required. Maintain current cultivation "
            "practices, ensure balanced irrigation and re-inspect weekly."
        ),
    },
    "Anthracnose": {
        "color": "amber",
        "description": (
            "Yam anthracnose presents as dark sunken lesions with concentric "
            "rings, often coalescing along veins. Caused by Colletotrichum "
            "spp. and accelerated by warm, humid weather."
        ),
        "recommendation": (
            "Apply copper- or mancozeb-based fungicide on a 7–10 day "
            "rotation. Remove and destroy heavily infected leaves, sanitise "
            "tools, and improve canopy airflow."
        ),
    },
    "Virus Infected": {
        "color": "rose",
        "description": (
            "Viral infection shows as mosaic patterns, leaf curl, or "
            "yellow-green chlorotic streaks. Commonly transmitted by aphids "
            "and infected planting material."
        ),
        "recommendation": (
            "Rogue and burn affected plants to limit spread. Control aphid "
            "vectors with approved insecticides, plant virus-tested setts, "
            "and rotate fields with non-host crops next season."
        ),
    },
}

# ---------------------------------------------------------------------------
# Model loading (lazy, cached)
# ---------------------------------------------------------------------------

_model = None


def get_model():
    global _model
    if _model is not None:
        return _model
    if _IMPORT_ERROR is not None:
        raise RuntimeError(
            f"TensorFlow not available: {_IMPORT_ERROR}"
        )
    model_path = MODEL_DIR / MODEL_FILENAME
    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found at {model_path}")
    logger.info("Loading Keras model from %s", model_path)
    _model = tf.keras.models.load_model(str(model_path), compile=False)
    logger.info(
        "Model loaded — input %s, output %s",
        _model.input_shape,
        _model.output_shape,
    )
    return _model


# ---------------------------------------------------------------------------
# Inference
# ---------------------------------------------------------------------------

IMG_SIZE = (224, 224)


def _prepare_image(image_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(image_bytes))
    img = ImageOps.exif_transpose(img).convert("RGB")
    img = img.resize(IMG_SIZE, Image.Resampling.LANCZOS)
    arr = np.array(img, dtype=np.float32)
    arr = preprocess_input(arr)  # MobileNetV2 expects scaled to [-1, 1]
    return np.expand_dims(arr, axis=0)


def _bbox_for(label: str) -> Optional[dict]:
    """Static box hint for the UI — model is a classifier, not detector."""
    boxes = {
        "Healthy": None,
        "Anthracnose": {"x": 0.14, "y": 0.18, "w": 0.6, "h": 0.6},
        "Virus Infected": {"x": 0.12, "y": 0.12, "w": 0.74, "h": 0.74},
    }
    return boxes.get(label)


def predict(image_bytes: bytes) -> dict:
    model = get_model()
    x = _prepare_image(image_bytes)
    preds = model.predict(x, verbose=0)[0]
    preds = np.asarray(preds, dtype=float)

    if preds.shape[0] != len(CLASS_NAMES):
        raise ValueError(
            f"Model returned {preds.shape[0]} classes but "
            f"{len(CLASS_NAMES)} class names are configured: {CLASS_NAMES}"
        )

    probs = {name: float(p) for name, p in zip(CLASS_NAMES, preds)}
    top_idx = int(np.argmax(preds))
    predicted_class = CLASS_NAMES[top_idx]
    confidence = float(preds[top_idx]) * 100.0

    # Severity = how "non-healthy" the leaf looks.
    healthy_prob = probs.get("Healthy", 0.0)
    leaf_health_score = healthy_prob * 100.0
    if predicted_class == "Healthy":
        severity = max(0.0, (1.0 - healthy_prob) * 100.0 * 0.25)
    else:
        # Weighted by both top-class probability and inverse health score.
        severity = (preds[top_idx] * 0.6 + (1.0 - healthy_prob) * 0.4) * 100.0

    info = CLASS_INFO.get(predicted_class, {})
    precision = CLASS_PRECISION.get(predicted_class, 0.9) * 100.0

    return {
        "predicted_class": predicted_class,
        "status_color": info.get("color", "emerald"),
        "confidence": round(confidence, 1),
        "precision": round(precision, 1),
        "severity": round(severity, 1),
        "leaf_health_score": round(leaf_health_score, 1),
        "description": info.get("description", ""),
        "recommendation": info.get("recommendation", ""),
        "probabilities": {k: round(v, 4) for k, v in probs.items()},
        "bounding_box": _bbox_for(predicted_class),
        "model_version": MODEL_VERSION,
    }

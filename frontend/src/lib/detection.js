/**
 * Real model inference — calls the FastAPI /api/predict endpoint backed by
 * MobileNetV2 (Keras). Replaces the previous client-side mock.
 */
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

async function dataUrlToBlob(dataUrl) {
    const res = await fetch(dataUrl);
    return await res.blob();
}

async function urlToBlob(url) {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`Could not load image (${res.status})`);
    return await res.blob();
}

/**
 * @param {string} imageSrc — data URL (uploaded) or http(s) URL (sample).
 * @returns normalized result identical in shape to what the UI consumes.
 */
export async function runDetection(imageSrc) {
    let blob;
    if (imageSrc.startsWith("data:")) {
        blob = await dataUrlToBlob(imageSrc);
    } else {
        blob = await urlToBlob(imageSrc);
    }
    const filename =
        blob.type && blob.type.includes("png") ? "leaf.png" : "leaf.jpg";
    const file = new File([blob], filename, {
        type: blob.type || "image/jpeg",
    });

    const form = new FormData();
    form.append("file", file);

    const { data } = await axios.post(`${API}/predict`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
    });

    return {
        id: data.id,
        status: data.predicted_class,
        statusColor: data.status_color,
        confidence: data.confidence,
        precision: data.precision,
        severity: data.severity,
        leafHealthScore: data.leaf_health_score,
        description: data.description,
        recommendation: data.recommendation,
        probabilities: data.probabilities,
        boundingBox: data.bounding_box,
        modelVersion: data.model_version,
        inferredAt: data.inferred_at,
        imageSrc,
    };
}

export async function fetchModelInfo() {
    const { data } = await axios.get(`${API}/model/info`);
    return data;
}

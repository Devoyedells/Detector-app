/**
 * Mock Yam Leaf Lesion Detection
 * -------------------------------------------------
 * Returns a structured result mimicking a real inference endpoint.
 * Designed to be a drop-in replacement target for a real model call:
 *
 *   async function runDetection(file) { ... fetch to your model ... }
 *
 * The UI only depends on the shape defined below — swap the function body
 * later with real API integration without touching components.
 */

export const LESION_CLASSES = [
    {
        id: "no-lesion",
        status: "No Lesion Detected",
        statusColor: "emerald",
        confidenceRange: [93, 98],
        severityRange: [0, 4],
        description:
            "Leaf surface appears uniformly pigmented with no visible chlorotic or necrotic regions. Vascular patterns look intact and margins are clean.",
        causes:
            "No bacterial, fungal, or environmental stressors detected in the imaged region.",
        treatment:
            "Maintain current cultivation practices. Keep monitoring weekly and preserve balanced irrigation and nutrition.",
        recommendation: "Routine monitoring — no intervention required.",
        boundingBox: null,
    },
    {
        id: "mild-lesion",
        status: "Mild Lesion",
        statusColor: "emerald",
        confidenceRange: [88, 94],
        severityRange: [8, 22],
        description:
            "Small, scattered yellow-brown specks observed, mostly near leaf margins. Lesion coalescence is minimal and interveinal tissue remains healthy.",
        causes:
            "Early-stage fungal or bacterial activity, often triggered by prolonged leaf wetness and moderate humidity (70–85%).",
        treatment:
            "Apply a copper-based foliar spray at label rate. Prune affected margins and improve airflow between plants.",
        recommendation:
            "Spot-treat now; re-inspect the same leaves in 5–7 days.",
        boundingBox: { x: 0.18, y: 0.28, w: 0.4, h: 0.26 },
    },
    {
        id: "moderate-lesion",
        status: "Moderate Lesion",
        statusColor: "amber",
        confidenceRange: [86, 93],
        severityRange: [30, 55],
        description:
            "Coalescing yellow-brown lesions with defined halos cover a noticeable portion of the lamina. Early wilting and edge curl are visible.",
        causes:
            "Active infection by Xanthomonas-type bacteria or anthracnose pathogens under warm (26–32°C), humid conditions.",
        treatment:
            "Begin systemic fungicide rotation (copper + mancozeb). Remove heavily affected leaves, sanitise tools, and reduce overhead irrigation.",
        recommendation:
            "Treat within 48h — escalation likely without intervention.",
        boundingBox: { x: 0.14, y: 0.2, w: 0.58, h: 0.56 },
    },
    {
        id: "severe-lesion",
        status: "Severe Lesion",
        statusColor: "rose",
        confidenceRange: [90, 97],
        severityRange: [62, 85],
        description:
            "Large necrotic patches with dried centres dominate the leaf surface. Tissue collapse is advanced and vein discoloration is evident.",
        causes:
            "Late-stage bacterial leaf blight / anthracnose, often compounded by nutrient imbalance and persistent wet foliage.",
        treatment:
            "Remove and incinerate affected leaves. Apply a full-strength systemic treatment and isolate the plant. Review drainage and spacing across the plot.",
        recommendation:
            "Urgent — contain spread and consider row-level intervention.",
        boundingBox: { x: 0.08, y: 0.1, w: 0.82, h: 0.78 },
    },
    {
        id: "sunburn",
        status: "Possible Sunburn / Leaf Damage",
        statusColor: "orange",
        confidenceRange: [80, 91],
        severityRange: [18, 40],
        description:
            "Bleached patches with crisp, papery texture concentrated on sun-exposed surfaces. No pathogen halos observed around lesions.",
        causes:
            "Abiotic stress — intense direct sunlight combined with low soil moisture or recent transplant shock.",
        treatment:
            "Provide partial shade during peak hours, mulch to retain moisture, and water deeply in the early morning.",
        recommendation:
            "Monitor for 5 days — symptoms should stabilise with better shade.",
        boundingBox: { x: 0.22, y: 0.3, w: 0.46, h: 0.32 },
    },
];

const randBetween = (min, max) =>
    Math.round((Math.random() * (max - min) + min) * 10) / 10;

export function pickClass(forcedId) {
    if (forcedId) {
        const found = LESION_CLASSES.find((c) => c.id === forcedId);
        if (found) return found;
    }
    // Weighted selection — lesion classes more likely than "no lesion"
    const weights = [1, 2, 3, 2, 1.5];
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < LESION_CLASSES.length; i++) {
        if ((r -= weights[i]) <= 0) return LESION_CLASSES[i];
    }
    return LESION_CLASSES[1];
}

export async function runMockDetection(
    imageSrc,
    { delay = 2400, forcedId = null } = {},
) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const cls = pickClass(forcedId);
            const confidence = randBetween(...cls.confidenceRange);
            const severity = randBetween(...cls.severityRange);
            resolve({
                id: cls.id,
                status: cls.status,
                statusColor: cls.statusColor,
                confidence,
                severity,
                description: cls.description,
                causes: cls.causes,
                treatment: cls.treatment,
                recommendation: cls.recommendation,
                boundingBox: cls.boundingBox,
                imageSrc,
                inferredAt: new Date().toISOString(),
                modelVersion: "yam-lesion-v0.1-mock",
            });
        }, delay);
    });
}

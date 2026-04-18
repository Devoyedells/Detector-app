/**
 * Sample yam leaf images. Each maps to a specific forcedId so the mock
 * returns the expected class when the user picks that thumbnail.
 * Using Unsplash direct URLs (no API key required).
 */
export const SAMPLE_IMAGES = [
    {
        id: "sample-healthy",
        forcedId: "no-lesion",
        label: "Healthy leaf",
        url: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&q=80&auto=format&fit=crop",
    },
    {
        id: "sample-mild",
        forcedId: "mild-lesion",
        label: "Mild lesion",
        url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80&auto=format&fit=crop",
    },
    {
        id: "sample-moderate",
        forcedId: "moderate-lesion",
        label: "Moderate lesion",
        url: "https://images.unsplash.com/photo-1597430203889-c93cce4aaa47?w=600&q=80&auto=format&fit=crop",
    },
    {
        id: "sample-severe",
        forcedId: "severe-lesion",
        label: "Severe lesion",
        url: "https://images.unsplash.com/photo-1543362906-acfc16c67564?w=600&q=80&auto=format&fit=crop",
    },
    {
        id: "sample-sunburn",
        forcedId: "sunburn",
        label: "Sunburn damage",
        url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=600&q=80&auto=format&fit=crop",
    },
];

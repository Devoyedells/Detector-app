# Yam Leaf Disease Detector — PRD

## Original Problem Statement
Build a modern, premium, frontend-only web app for a "Yam Leaf Disease Detector" that matches the provided reference image exactly. Dark glassmorphism, soft glow, deep space background, green accents. Frontend-only with mock detection now; structured so a real trained model can be plugged in later.

## User Personas
- Agricultural researcher reviewing yam leaf images for anthracnose / lesion severity
- Field agronomist quickly checking leaf samples and getting treatment guidance
- Farmer / extension worker looking for accessible, jargon-free diagnosis UI

## Core Requirements (static)
- Frontend-only (React CRA + Tailwind + framer-motion + shadcn/ui)
- Dark glassmorphism UI with starfield background; emerald accent
- Image upload (drag-drop + click) + 5 pre-loaded sample leaves
- Mock detection flow with ~2.5s simulated loading
- Output: Status, Confidence %, Severity %, Description, Causes, Treatment, Recommendation
- 5 Lesion classes: No Lesion, Mild, Moderate, Severe, Possible Sunburn
- Layout: left column (disease title + image w/ bbox overlay + metrics + about + actions), right column (Detection Result panel + Get Treatment Tips)
- Top bar: leaf logo, search (expandable), profile dropdown (Profile/Settings/Logout)
- Plug-in-ready: `runMockDetection` in `src/lib/mockDetection.js` is the single swap-point for a real model API

## What's Been Implemented (2026-02-18)
- StarField background with twinkle + galaxy glows
- TopBar with animated logo, expanding search, Radix DropdownMenu profile (Profile/Settings/Logout with sonner toasts)
- UploadZone with drag-drop + click
- ImagePreview with animated scanning line during loading, bbox overlay + status label after detection, corner markers
- MetricsPanel with animated confidence + severity bars (color by class)
- AboutCard (inline on left) + DetectionResult (right panel with Description/Causes/Treatment + Get Treatment Tips)
- SampleGallery: 5 yam leaf thumbnails (healthy, mild, moderate, severe, sunburn) — clicking loads into preview and feeds forcedId to mock
- Reset / Upload New Image / Detect buttons with proper disabled/loading states
- Status chip on Detection Result (color-coded)
- Sonner toasts for all mock actions
- Responsive: desktop 2-column, tablet/mobile stack

## Prioritised Backlog

### P0 (blocking for production)
- Replace `runMockDetection` with a real inference endpoint once the model is packaged (ONNX/TorchScript/HF Space). Only `src/lib/mockDetection.js` needs to change.
- Host a custom, owned dataset of yam leaf thumbnails (replace Unsplash hotlinks).

### P1 (high-impact, post-MVP)
- Real authentication (replace profile dropdown mocks) — JWT or Emergent Google Auth
- Persist detection history per user (list view + compare two leaves side by side)
- "Flag as Incorrect" feedback loop → feeds back into retraining pipeline (per user's model plan)
- Side-by-side comparison of multiple model versions with confidence scores
- Download / share detection report (PDF with image + bbox + findings)

### P2 (nice to have)
- Drag to re-crop the analysed region
- Grad-CAM / saliency overlay showing which regions influenced the prediction
- Batch upload (ZIP of leaf images)
- Multilingual UI (EN / FR / local languages for West African farmers)
- Offline PWA mode for field use

## Next Tasks
1. Replace Moderate lesion Unsplash URL (done 2026-02-18) and verify all 5 thumbnails load
2. (Optional) Package trained yam anthracnose model and wire up real endpoint
3. (Optional) Add "Flag as Incorrect" + feedback capture to prepare for MLOps loop

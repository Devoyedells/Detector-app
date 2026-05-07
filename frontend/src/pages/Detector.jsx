import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Zap, RotateCcw, Circle } from "lucide-react";
import { StarField } from "../components/StarField";
import { TopBar } from "../components/TopBar";
import { UploadZone } from "../components/UploadZone";
import { ImagePreview } from "../components/ImagePreview";
import { MetricsPanel } from "../components/MetricsPanel";
import { AboutCard } from "../components/AboutCard";
import { DetectionResult } from "../components/DetectionResult";
import { SampleGallery } from "../components/SampleGallery";
import { Button } from "../components/ui/button";
import { runDetection } from "../lib/detection";
import { toast } from "sonner";

const statusDot = {
    emerald: "#34d399",
    amber: "#fbbf24",
    rose: "#fb7185",
    orange: "#fb923c",
};

export default function Detector() {
    const [imageSrc, setImageSrc] = useState(null);
    const [activeSampleId, setActiveSampleId] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleUpload = (src) => {
        setImageSrc(src);
        setActiveSampleId(null);
        setResult(null);
    };

    const handleSample = (sample) => {
        setImageSrc(sample.url);
        setActiveSampleId(sample.id);
        setResult(null);
    };

    const handleDetect = async () => {
        if (!imageSrc || loading) return;
        setLoading(true);
        setResult(null);
        try {
            const r = await runDetection(imageSrc);
            setResult(r);
            toast.success(
                `${r.status} · ${r.confidence.toFixed(1)}% confidence`,
            );
        } catch (err) {
            const msg =
                err?.response?.data?.detail ||
                err?.message ||
                "Detection failed. Please try again.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setImageSrc(null);
        setResult(null);
        setActiveSampleId(null);
        setLoading(false);
    };

    const triggerUpload = () => fileInputRef.current?.click();
    const onFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => handleUpload(ev.target.result);
        reader.readAsDataURL(file);
    };

    const diseaseTitle = result
        ? `Class: ${result.status}`
        : imageSrc
          ? "Ready to analyze"
          : "Awaiting sample";
    const dotColor = result ? statusDot[result.statusColor] : "#64748b";

    return (
        <div className="relative min-h-screen">
            <StarField />

            <div className="relative z-10 mx-auto max-w-[1280px] px-4 pb-16 pt-2 sm:px-6 lg:px-8">
                <TopBar />

                <motion.main
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                    className="relative"
                >
                    <div className="noise relative rounded-[32px] glass-strong p-5 sm:p-6 lg:p-8 overflow-hidden">
                        {/* Soft inner glow accent */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[520px] -translate-x-1/2 rounded-full blur-3xl opacity-40"
                            style={{
                                background:
                                    "radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 70%)",
                            }}
                        />

                        <div className="relative grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-6 lg:gap-7">
                            {/* LEFT COLUMN */}
                            <div className="flex flex-col gap-5">
                                {/* Title bar */}
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div
                                        data-testid="disease-title"
                                        className="flex items-center gap-3"
                                    >
                                        <motion.div
                                            animate={{
                                                boxShadow: result
                                                    ? `0 0 22px ${dotColor}`
                                                    : "0 0 0 rgba(0,0,0,0)",
                                            }}
                                            className="grid h-7 w-7 place-items-center rounded-full"
                                            style={{
                                                background: `${dotColor}22`,
                                            }}
                                        >
                                            <Circle
                                                className="h-3 w-3"
                                                fill={dotColor}
                                                color={dotColor}
                                            />
                                        </motion.div>
                                        <h2 className="font-display text-xl sm:text-2xl font-semibold text-white tracking-tight">
                                            {diseaseTitle}
                                        </h2>
                                    </div>
                                    {result && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-slate-300"
                                        >
                                            {result.modelVersion}
                                        </motion.div>
                                    )}
                                </div>

                                {/* Image + metrics grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <AnimatePresence mode="wait">
                                            {imageSrc ? (
                                                <motion.div
                                                    key="preview"
                                                    initial={{
                                                        opacity: 0,
                                                        scale: 0.98,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        scale: 1,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        scale: 0.98,
                                                    }}
                                                    transition={{
                                                        duration: 0.4,
                                                    }}
                                                >
                                                    <ImagePreview
                                                        imageSrc={imageSrc}
                                                        result={result}
                                                        analyzing={loading}
                                                    />
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="upload"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    <UploadZone
                                                        onPick={handleUpload}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {result ? (
                                            <MetricsPanel result={result} />
                                        ) : loading ? (
                                            <div className="glass-inner p-5">
                                                <SkeletonMetric />
                                                <div className="h-4" />
                                                <SkeletonMetric />
                                            </div>
                                        ) : (
                                            <div
                                                data-testid="placeholder-metrics"
                                                className="glass-inner p-5 text-center"
                                            >
                                                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-mono">
                                                    Confidence
                                                </p>
                                                <p className="mt-2 font-display text-3xl font-semibold text-slate-600">
                                                    —%
                                                </p>
                                                <div className="mt-3 h-2.5 rounded-full bg-white/[0.04]" />
                                                <p className="mt-4 text-xs text-slate-500">
                                                    Run detection to see confidence & severity.
                                                </p>
                                            </div>
                                        )}

                                        {result && <AboutCard result={result} />}
                                    </div>
                                </div>

                                {/* Sample gallery */}
                                <SampleGallery
                                    onPick={handleSample}
                                    activeId={activeSampleId}
                                />

                                {/* Actions */}
                                <div className="flex flex-col items-stretch gap-3 pt-1 sm:flex-row sm:items-center sm:justify-end">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={onFileChange}
                                        className="hidden"
                                        data-testid="hidden-file-input"
                                    />
                                    <Button
                                        data-testid="upload-new-btn"
                                        variant="outline"
                                        onClick={triggerUpload}
                                        className="h-11 rounded-full border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06] hover:text-white hover:border-white/20"
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload New Image
                                    </Button>
                                    <Button
                                        data-testid="detect-btn"
                                        onClick={handleDetect}
                                        disabled={!imageSrc || loading}
                                        className="group relative h-11 min-w-[140px] rounded-full bg-emerald-500 font-semibold text-emerald-950 hover:bg-emerald-400 transition disabled:opacity-40 disabled:cursor-not-allowed glow-green"
                                    >
                                        <Zap
                                            className={`mr-1.5 h-4 w-4 ${
                                                loading ? "animate-pulse" : ""
                                            }`}
                                        />
                                        {loading ? "Detecting…" : "Detect"}
                                    </Button>
                                    <button
                                        data-testid="reset-btn"
                                        onClick={handleReset}
                                        disabled={!imageSrc && !result}
                                        className="inline-flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-emerald-300 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5" />
                                        Reset
                                    </button>
                                </div>
                            </div>

                            {/* RIGHT COLUMN */}
                            <div className="lg:sticky lg:top-6">
                                <DetectionResult
                                    result={result}
                                    loading={loading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer caption */}
                    <p className="mt-6 text-center text-[11px] font-mono uppercase tracking-[0.22em] text-slate-500">
                        MobileNetV2 · 3-class yam leaf classifier · live inference
                    </p>
                </motion.main>
            </div>
        </div>
    );
}

const SkeletonMetric = () => (
    <div className="space-y-2">
        <div className="flex justify-between">
            <div className="h-3 w-24 rounded bg-white/[0.06]" />
            <div className="h-3 w-10 rounded bg-white/[0.06]" />
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
            <div className="h-full w-1/3 bar-shimmer" />
        </div>
    </div>
);

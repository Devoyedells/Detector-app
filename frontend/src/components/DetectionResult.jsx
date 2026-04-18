import { motion, AnimatePresence } from "framer-motion";
import {
    Beaker,
    ShieldCheck,
    Stethoscope,
    Sparkles,
    ChevronRight,
    Clock,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const statusChip = {
    emerald: "bg-emerald-400/15 text-emerald-300 border-emerald-400/25",
    amber: "bg-amber-400/15 text-amber-300 border-amber-400/25",
    rose: "bg-rose-400/15 text-rose-300 border-rose-400/25",
    orange: "bg-orange-400/15 text-orange-300 border-orange-400/25",
};

const Section = ({ icon: Icon, title, children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="space-y-2"
    >
        <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-emerald-300" />
            <h4 className="font-display text-sm font-semibold text-white">
                {title}
            </h4>
        </div>
        <p className="text-sm leading-relaxed text-slate-400">{children}</p>
    </motion.div>
);

export const DetectionResult = ({ result, loading }) => {
    return (
        <div
            data-testid="detection-result"
            className="glass rounded-[28px] p-6 sm:p-7 card-hover h-full flex flex-col"
        >
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div
                        className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-400/25"
                        style={{
                            background:
                                "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.05))",
                            boxShadow:
                                "0 0 22px rgba(34,197,94,0.2), inset 0 1px 0 rgba(255,255,255,0.06)",
                        }}
                    >
                        <Sparkles className="h-4 w-4 text-emerald-300" />
                    </div>
                    <h2 className="font-display text-lg font-semibold text-white">
                        Detection Result
                    </h2>
                </div>
                {result && (
                    <span
                        data-testid="status-chip"
                        className={`rounded-full border px-3 py-1 text-[11px] font-medium ${
                            statusChip[result.statusColor] || statusChip.emerald
                        }`}
                    >
                        {result.status}
                    </span>
                )}
            </div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <LoadingState key="loading" />
                ) : result ? (
                    <motion.div
                        key={result.id + result.inferredAt}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col gap-5 flex-1"
                    >
                        <Section icon={Stethoscope} title="About This Disease" delay={0.05}>
                            {result.recommendation}
                        </Section>
                        <div className="h-px w-full bg-white/5" />
                        <Section icon={Sparkles} title="Description" delay={0.15}>
                            {result.description}
                        </Section>
                        <Section icon={Beaker} title="Causes" delay={0.25}>
                            {result.causes}
                        </Section>
                        <Section icon={ShieldCheck} title="Treatment" delay={0.35}>
                            {result.treatment}
                        </Section>

                        <div className="mt-auto flex flex-col gap-3 pt-4">
                            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-2.5 text-[11px] text-slate-400 font-mono">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" />
                                    {new Date(result.inferredAt).toLocaleTimeString()}
                                </span>
                                <span>{result.modelVersion}</span>
                            </div>
                            <Button
                                data-testid="treatment-tips-btn"
                                onClick={() =>
                                    toast.success(
                                        "Treatment tips sent to your inbox (mock)",
                                    )
                                }
                                className="group h-11 w-full rounded-full border border-white/10 bg-white/[0.04] text-slate-100 hover:bg-emerald-400/10 hover:text-emerald-200 hover:border-emerald-400/30 transition"
                            >
                                Get Treatment Tips
                                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <EmptyState key="empty" />
                )}
            </AnimatePresence>
        </div>
    );
};

const LoadingState = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-1 flex-col items-center justify-center gap-5 py-14 text-center"
    >
        <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/10" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-emerald-400 border-r-emerald-400/40" />
            <div className="absolute inset-2 grid place-items-center rounded-full bg-emerald-400/10">
                <Sparkles className="h-4 w-4 text-emerald-300" />
            </div>
        </div>
        <div>
            <p className="font-display text-base font-semibold text-slate-100">
                Analyzing leaf pattern…
            </p>
            <p className="mt-1 text-xs text-slate-400 font-mono uppercase tracking-widest">
                Running lesion segmentation
            </p>
        </div>
        <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.2,
                    }}
                />
            ))}
        </div>
    </motion.div>
);

const EmptyState = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-1 flex-col items-center justify-center gap-4 py-12 text-center"
    >
        <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/5 bg-white/[0.02]">
            <Sparkles className="h-5 w-5 text-slate-500" />
        </div>
        <div>
            <p className="font-display text-sm font-semibold text-slate-300">
                No analysis yet
            </p>
            <p className="mt-1 text-xs text-slate-500 max-w-[220px]">
                Upload or select a sample leaf to see detection results here.
            </p>
        </div>
    </motion.div>
);

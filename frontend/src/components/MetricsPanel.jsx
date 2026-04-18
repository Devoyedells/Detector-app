import { motion } from "framer-motion";
import { Activity, Gauge } from "lucide-react";

const Bar = ({ value, label, hint, icon: Icon, accent, delay = 0, testId }) => {
    const colorMap = {
        emerald: {
            from: "#10b981",
            to: "#86efac",
            glow: "rgba(34,197,94,0.35)",
            text: "text-emerald-300",
        },
        amber: {
            from: "#f59e0b",
            to: "#fde68a",
            glow: "rgba(251,191,36,0.35)",
            text: "text-amber-300",
        },
        rose: {
            from: "#f43f5e",
            to: "#fda4af",
            glow: "rgba(251,113,133,0.35)",
            text: "text-rose-300",
        },
        orange: {
            from: "#fb923c",
            to: "#fed7aa",
            glow: "rgba(251,146,60,0.35)",
            text: "text-orange-300",
        },
    };
    const c = colorMap[accent] || colorMap.emerald;

    return (
        <div data-testid={testId} className="space-y-2.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                    <Icon className={`h-4 w-4 ${c.text}`} />
                    <span className="text-sm font-medium">{label}</span>
                </div>
                <motion.span
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: delay + 0.6 }}
                    className={`font-mono text-sm font-semibold ${c.text}`}
                >
                    {value.toFixed(1)}%
                </motion.span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/[0.04] ring-1 ring-inset ring-white/5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{
                        delay,
                        duration: 1.1,
                        ease: [0.2, 0.8, 0.2, 1],
                    }}
                    className="relative h-full rounded-full"
                    style={{
                        background: `linear-gradient(90deg, ${c.from} 0%, ${c.to} 100%)`,
                        boxShadow: `0 0 18px ${c.glow}`,
                    }}
                >
                    <div
                        className="absolute inset-0 rounded-full opacity-60"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                            backgroundSize: "200% 100%",
                            animation: "shimmer 2.2s linear infinite",
                        }}
                    />
                </motion.div>
            </div>
            {hint && (
                <p className="text-xs text-slate-500">{hint}</p>
            )}
        </div>
    );
};

export const MetricsPanel = ({ result }) => {
    return (
        <motion.div
            data-testid="metrics-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-inner p-5 space-y-5"
        >
            <Bar
                testId="confidence-bar"
                label="Confidence"
                hint="Model certainty in the predicted class."
                icon={Gauge}
                value={result.confidence}
                accent="emerald"
                delay={0.1}
            />
            <Bar
                testId="severity-bar"
                label="Severity"
                hint="Estimated % of leaf surface affected."
                icon={Activity}
                value={result.severity}
                accent={result.statusColor}
                delay={0.35}
            />
        </motion.div>
    );
};

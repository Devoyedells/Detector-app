import { motion, AnimatePresence } from "framer-motion";
import { Leaf } from "lucide-react";

/**
 * Leaf preview panel with optional bounding-box overlay & label.
 * States: idle (image only) · analyzing (scan line) · detected (bbox).
 */
export const ImagePreview = ({ imageSrc, result, analyzing }) => {
    const bbox = result?.boundingBox;
    const colorMap = {
        emerald: ["#34d399", "rgba(52,211,153,0.18)"],
        amber: ["#fbbf24", "rgba(251,191,36,0.18)"],
        rose: ["#fb7185", "rgba(251,113,133,0.18)"],
        orange: ["#fb923c", "rgba(251,146,60,0.18)"],
    };
    const [stroke, fill] =
        colorMap[result?.statusColor] || colorMap.emerald;

    return (
        <div
            data-testid="image-preview"
            className="relative h-[420px] overflow-hidden rounded-2xl border border-white/10 bg-[#05070e]"
        >
            <img
                src={imageSrc}
                alt="Uploaded yam leaf"
                className="h-full w-full object-cover"
                draggable={false}
            />

            {/* Vignette */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

            {/* Scanning animation while analyzing */}
            <AnimatePresence>
                {analyzing && (
                    <motion.div
                        key="scanner"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pointer-events-none absolute inset-0 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-emerald-500/5" />
                        <div
                            className="animate-scan absolute left-0 right-0 h-28"
                            style={{
                                background:
                                    "linear-gradient(180deg, transparent 0%, rgba(34,197,94,0.35) 50%, transparent 100%)",
                                filter: "blur(2px)",
                            }}
                        />
                        <div className="absolute inset-0 border border-emerald-400/30" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bounding box + label after detection */}
            <AnimatePresence>
                {bbox && !analyzing && (
                    <motion.div
                        key="bbox"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            delay: 0.1,
                            duration: 0.5,
                            ease: [0.2, 0.8, 0.2, 1],
                        }}
                        data-testid="detection-bbox"
                        className="absolute rounded-lg"
                        style={{
                            left: `${bbox.x * 100}%`,
                            top: `${bbox.y * 100}%`,
                            width: `${bbox.w * 100}%`,
                            height: `${bbox.h * 100}%`,
                            border: `1.5px solid ${stroke}`,
                            background: fill,
                            boxShadow: `0 0 0 2px rgba(0,0,0,0.25), 0 0 24px ${stroke}55`,
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            className="absolute -top-px left-0 flex translate-y-[-100%] items-center gap-1.5 rounded-t-md px-2.5 py-1.5 text-xs font-medium"
                            style={{
                                background: stroke,
                                color: "#041017",
                            }}
                        >
                            <Leaf className="h-3.5 w-3.5" strokeWidth={2.6} />
                            <span>
                                {result.status} ({Math.round(result.confidence)}%)
                            </span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Corner markers */}
            <div className="pointer-events-none absolute inset-3 flex flex-col justify-between">
                <div className="flex justify-between">
                    <Corner position="tl" />
                    <Corner position="tr" />
                </div>
                <div className="flex justify-between">
                    <Corner position="bl" />
                    <Corner position="br" />
                </div>
            </div>
        </div>
    );
};

const Corner = ({ position }) => {
    const base = "h-4 w-4 border-white/40";
    const map = {
        tl: "border-t border-l",
        tr: "border-t border-r",
        bl: "border-b border-l",
        br: "border-b border-r",
    };
    return <div className={`${base} ${map[position]}`} />;
};

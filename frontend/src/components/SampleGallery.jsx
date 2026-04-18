import { motion } from "framer-motion";
import { SAMPLE_IMAGES } from "../lib/sampleImages";
import { Sparkles } from "lucide-react";

export const SampleGallery = ({ onPick, activeId }) => {
    return (
        <motion.div
            data-testid="sample-gallery"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="space-y-3"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                    <h4 className="font-display text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                        Try a sample
                    </h4>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                    {SAMPLE_IMAGES.length} scenarios
                </span>
            </div>
            <div className="grid grid-cols-5 gap-2.5">
                {SAMPLE_IMAGES.map((s, i) => {
                    const active = activeId === s.id;
                    return (
                        <motion.button
                            key={s.id}
                            data-testid={`sample-${s.id}`}
                            onClick={() => onPick(s)}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.96 }}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.05 }}
                            className={`group relative aspect-square overflow-hidden rounded-xl border transition-all ${
                                active
                                    ? "border-emerald-400/60 shadow-[0_0_0_1px_rgba(34,197,94,0.3),0_0_24px_rgba(34,197,94,0.25)]"
                                    : "border-white/10 hover:border-emerald-400/30"
                            }`}
                        >
                            <img
                                src={s.url}
                                alt={s.label}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                            <span className="absolute bottom-1 left-1.5 right-1.5 truncate text-left text-[10px] font-medium text-white/90">
                                {s.label}
                            </span>
                            {active && (
                                <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#22c55e]" />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
};

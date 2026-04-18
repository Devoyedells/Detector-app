import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

export const AboutCard = ({ result }) => {
    return (
        <motion.div
            data-testid="about-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="glass-inner p-5"
        >
            <div className="mb-3 flex items-center gap-2">
                <Leaf className="h-4 w-4 text-emerald-300" />
                <h3 className="font-display text-base font-semibold text-white">
                    About This Disease
                </h3>
            </div>
            <h4 className="font-display text-sm font-semibold text-slate-200">
                Description
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">
                {result.description}
            </p>
        </motion.div>
    );
};

import { useRef, useState } from "react";
import { UploadCloud, ImagePlus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const UploadZone = ({ onPick }) => {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const handleFile = (file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file (JPG, PNG, WebP)");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => onPick(e.target.result, file.name);
        reader.readAsDataURL(file);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files?.[0]);
    };

    return (
        <motion.div
            data-testid="upload-zone"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            className={`relative flex h-[420px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-all ${
                dragging
                    ? "border-emerald-400/70 bg-emerald-400/5"
                    : "border-white/10 bg-white/[0.02] hover:border-emerald-400/40 hover:bg-white/[0.04]"
            }`}
        >
            <input
                ref={inputRef}
                data-testid="file-input"
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="hidden"
            />
            <motion.div
                animate={dragging ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className="grid h-16 w-16 place-items-center rounded-2xl"
                style={{
                    background:
                        "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(16,185,129,0.05))",
                    border: "1px solid rgba(34,197,94,0.25)",
                    boxShadow: "0 0 28px rgba(34,197,94,0.22)",
                }}
            >
                <UploadCloud className="h-7 w-7 text-emerald-300" />
            </motion.div>
            <h3 className="mt-5 font-display text-lg font-semibold text-white">
                Drop a yam leaf image here
            </h3>
            <p className="mt-1.5 max-w-xs text-sm text-slate-400">
                Drag & drop or click to upload. PNG, JPG, WebP up to 10MB.
            </p>
            <div className="mt-5 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300">
                <ImagePlus className="h-3.5 w-3.5 text-emerald-300" />
                <span>
                    Tip: a clear, top-down shot works best for lesion analysis
                </span>
            </div>
        </motion.div>
    );
};

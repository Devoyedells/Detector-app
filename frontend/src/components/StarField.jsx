import { useMemo } from "react";

/**
 * Lightweight animated starfield — pure CSS, no canvas.
 * Generates ~120 small stars with randomised positions / twinkle delays.
 */
export const StarField = () => {
    const stars = useMemo(() => {
        return Array.from({ length: 140 }).map((_, i) => {
            const size = Math.random() < 0.85 ? 1 : Math.random() < 0.95 ? 2 : 3;
            return {
                id: i,
                top: Math.random() * 100,
                left: Math.random() * 100,
                size,
                delay: Math.random() * 6,
                duration: 2.5 + Math.random() * 4,
                opacity: 0.3 + Math.random() * 0.7,
            };
        });
    }, []);

    return (
        <div
            aria-hidden="true"
            data-testid="starfield"
            className="pointer-events-none fixed inset-0 overflow-hidden"
            style={{ zIndex: 0 }}
        >
            {/* distant galaxy glows */}
            <div
                className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full opacity-40 blur-3xl"
                style={{
                    background:
                        "radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 60%)",
                }}
            />
            <div
                className="absolute bottom-0 right-0 h-[620px] w-[620px] rounded-full opacity-30 blur-3xl"
                style={{
                    background:
                        "radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 60%)",
                }}
            />
            <div
                className="absolute top-1/3 left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
                style={{
                    background:
                        "radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 60%)",
                }}
            />

            {stars.map((s) => (
                <span
                    key={s.id}
                    className="absolute rounded-full bg-white animate-twinkle"
                    style={{
                        top: `${s.top}%`,
                        left: `${s.left}%`,
                        width: s.size,
                        height: s.size,
                        opacity: s.opacity,
                        animationDelay: `${s.delay}s`,
                        animationDuration: `${s.duration}s`,
                        boxShadow:
                            s.size > 1
                                ? "0 0 6px rgba(255,255,255,0.85)"
                                : "none",
                    }}
                />
            ))}
        </div>
    );
};

"use client";

const BARS = [2, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2];

type PageLoaderProps = {
    label?: string;
    className?: string;
};

export default function PageLoader({
    label = "Loading",
    className = "",
}: PageLoaderProps) {
    return (
        <div
            role="status"
            aria-live="polite"
            className={`inline-flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-3 shadow-lg shadow-black/20 ${className}`}
        >
            {/* Mini receipt with barcode + scan beam */}
            <div className="relative h-11 w-9 shrink-0 overflow-hidden rounded-[5px] bg-white px-1.5 pt-1.5">
                <div className="mb-1 h-[3px] w-full rounded-full bg-slate-300" />
                <div className="mb-1.5 h-[3px] w-2/3 rounded-full bg-slate-300" />
                <div className="flex h-5 items-stretch justify-center gap-[1px]">
                    {BARS.map((b, i) => (
                        <span
                            key={i}
                            className="bg-slate-800"
                            style={{ width: `${b}px` }}
                        />
                    ))}
                </div>
                <span className="pl-scan absolute inset-x-0 h-[2px] bg-emerald-400 shadow-[0_0_6px_1px_rgba(52,211,153,0.9)]" />
            </div>

            {/* Label + progress */}
            <div className="flex min-w-[110px] flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-300">
                    {label}
                    <span className="pl-dots" />
                </span>
                <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
                    <div className="pl-bar h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-300" />
                </div>
            </div>

            <style>{`
                @keyframes pl-scan {
                    0%, 100% { top: 4px; }
                    50%      { top: calc(100% - 6px); }
                }
                @keyframes pl-bar {
                    0%   { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                }
                @keyframes pl-dots {
                    0%   { content: ""; }
                    25%  { content: "."; }
                    50%  { content: ".."; }
                    75%  { content: "..."; }
                }
                .pl-scan { animation: pl-scan 1.2s ease-in-out infinite; }
                .pl-bar  { animation: pl-bar 1.4s ease-in-out infinite; }
                .pl-dots::after { content: ""; animation: pl-dots 1.2s steps(1) infinite; }
                @media (prefers-reduced-motion: reduce) {
                    .pl-scan, .pl-bar, .pl-dots::after { animation: none !important; }
                }
            `}</style>
        </div>
    );
}
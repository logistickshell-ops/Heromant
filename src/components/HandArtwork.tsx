import { useRef, useState } from "react";
import { LinesState } from "../utils/palmistryRules";
import { Image, FileText, Sparkles, Check } from "lucide-react";

interface HandArtworkProps {
  lines: LinesState;
  name: string;
}

export default function HandArtwork({ lines, name }: HandArtworkProps) {
  const artworkRef = useRef<SVGSVGElement | null>(null);
  const [downloaded, setDownloaded] = useState<string | null>(null);
  const [artworkId] = useState(() => Math.floor(Math.random() * 89999 + 10000));

  const buildSVGString = (): string => {
    const ns = "http://www.w3.org/2000/svg";
    return `<svg xmlns="${ns}" viewBox="0 0 500 500" width="500" height="500">
  <defs><radialGradient id="bg" cx="50%" cy="45%"><stop offset="0" stop-color="#31263b"/><stop offset="0.72" stop-color="#16101d"/><stop offset="1" stop-color="#08070c"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="5"/></filter><clipPath id="disc"><circle cx="250" cy="250" r="226"/></clipPath></defs>
  <rect width="500" height="500" fill="#09070d"/>
  <circle cx="250" cy="250" r="232" fill="url(#bg)" stroke="#d5a74b" stroke-width="2"/>
  <circle cx="250" cy="250" r="222" fill="none" stroke="#8f6730" stroke-width="1" stroke-dasharray="2 8"/>
  <circle cx="250" cy="250" r="214" fill="none" stroke="#f3d486" stroke-opacity=".45" stroke-width="1"/>
  <g clip-path="url(#disc)">
    <circle cx="250" cy="250" r="170" fill="none" stroke="#d7ad58" stroke-opacity=".14" stroke-width="1"/>
    <path d="M250 28v28M250 444v28M28 250h28M444 250h28" stroke="#f3d486" stroke-opacity=".55" stroke-width="2"/>
    <path d="M93 93l20 20M387 93l-20 20M93 407l20-20M387 407l-20-20" stroke="#f3d486" stroke-opacity=".35" stroke-width="2"/>
    <circle cx="250" cy="250" r="180" fill="none" stroke="#f6c96b" stroke-opacity=".35" stroke-width="10" filter="url(#glow)"/>
  <path d="M 120 400 C 100 350, 70 250, 90 200 C 100 170, 120 150, 130 180 C 140 210, 150 140, 165 110 C 175 90, 195 90, 200 120 C 210 150, 220 120, 235 80 C 245 50, 270 50, 275 80 C 285 130, 290 110, 310 90 C 320 70, 345 70, 345 100 C 345 130, 340 180, 360 150 C 375 130, 395 140, 390 180 C 380 250, 410 320, 390 380 C 370 430, 300 460, 240 460 C 180 460, 140 430, 120 400 Z" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1.5"/>
  <path d="M ${lines.heart.start.x} ${lines.heart.start.y} Q ${lines.heart.control.x} ${lines.heart.control.y} ${lines.heart.end.x} ${lines.heart.end.y}" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <path d="M ${lines.head.start.x} ${lines.head.start.y} Q ${lines.head.control.x} ${lines.head.control.y} ${lines.head.end.x} ${lines.head.end.y}" fill="none" stroke="#E5E7EB" stroke-width="2.5" stroke-opacity="0.85" stroke-linecap="round"/>
  <path d="M ${lines.life.start.x} ${lines.life.start.y} Q ${lines.life.control.x} ${lines.life.control.y} ${lines.life.end.x} ${lines.life.end.y}" fill="none" stroke="#D1D5DB" stroke-width="2.5" stroke-opacity="0.85" stroke-linecap="round"/>
  <path d="M ${lines.fate.start.x} ${lines.fate.start.y} Q ${lines.fate.control.x} ${lines.fate.control.y} ${lines.fate.end.x} ${lines.fate.end.y}" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-opacity="0.7" stroke-linecap="round"/>
  <circle cx="${lines.heart.start.x}" cy="${lines.heart.start.y}" r="2" fill="#fff"/>
  <circle cx="${lines.heart.end.x}" cy="${lines.heart.end.y}" r="2" fill="#fff"/>
  <circle cx="${lines.head.end.x}" cy="${lines.head.end.y}" r="2" fill="#fff"/>
  <circle cx="${lines.life.end.x}" cy="${lines.life.end.y}" r="2" fill="#fff"/>
  </g><text x="250" y="488" text-anchor="middle" fill="#f3d486" fill-opacity=".65" font-size="10" letter-spacing="3">ХИРОМАНТИЯ</text>
</svg>`;
  };

  const downloadAsSVG = () => {
    const svgString = buildSVGString();
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chiromancy-${name || "art"}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloaded("svg");
    setTimeout(() => setDownloaded(null), 3000);
  };

  const downloadAsPNG = () => {
    const svgString = buildSVGString();
    const img = document.createElement("img") as HTMLImageElement;
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, 1000, 1000);
        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            const pngUrl = URL.createObjectURL(pngBlob);
            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = `chiromancy-${name || "art"}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(pngUrl);
          }
          setDownloaded("png");
          setTimeout(() => setDownloaded(null), 3000);
        }, "image/png");
      }
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      // Fallback: offer SVG instead
      downloadAsSVG();
    };
    img.src = url;
  };

  const currentDate = new Date().toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#111111] text-zinc-100 rounded-3xl shadow-xl max-w-md mx-auto my-8 border border-zinc-800">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-light tracking-widest uppercase mb-1">
          <Sparkles size={12} />
          Ваша личная карта
        </div>
        <h3 className="text-xl font-light tracking-widest uppercase">
          Произведение Судьбы
        </h3>
      </div>

      {/* SVG Artwork container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-amber-500/30 bg-[#09070d] p-2 shadow-[0_0_45px_rgba(212,160,66,0.18)] flex items-center justify-center">
        {/* Sacred Geometry Background */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30"><div className="h-[92%] w-[92%] rounded-full border border-amber-300/60" /><div className="absolute h-[82%] w-[82%] rounded-full border border-dashed border-amber-200/40 animate-spin-slow" /></div>

        {/* The Art */}
        <svg
          ref={artworkRef}
          viewBox="0 0 500 500"
          className="relative z-10 h-full w-full rounded-full drop-shadow-[0_0_20px_rgba(245,190,80,0.28)]"
          style={{ clipPath: "circle(47% at 50% 50%)" }}
        >
          <defs>
            <radialGradient id="vignette-bg" cx="50%" cy="45%">
              <stop offset="0%" stopColor="#382b45" />
              <stop offset="72%" stopColor="#17111f" />
              <stop offset="100%" stopColor="#08070c" />
            </radialGradient>
            <filter id="vignette-glow"><feGaussianBlur stdDeviation="7" /></filter>
          </defs>
          <circle cx="250" cy="250" r="250" fill="url(#vignette-bg)" />
          <circle cx="250" cy="250" r="226" fill="none" stroke="#d5a74b" strokeWidth="2" />
          <circle cx="250" cy="250" r="216" fill="none" stroke="#f3d486" strokeOpacity=".45" strokeWidth="1" />
          <circle cx="250" cy="250" r="184" fill="none" stroke="#f6c96b" strokeOpacity=".35" strokeWidth="10" filter="url(#vignette-glow)" />
          <path d="M250 24v30M250 446v30M24 250h30M446 250h30M90 90l22 22M410 90l-22 22M90 410l22-22M410 410l-22-22" stroke="#f3d486" strokeOpacity=".55" strokeWidth="2" />
          {/* Subtle Hand Outline Silhouette */}
          <path
            d="M 120 400 C 100 350, 70 250, 90 200 C 100 170, 120 150, 130 180 C 140 210, 150 140, 165 110 C 175 90, 195 90, 200 120 C 210 150, 220 120, 235 80 C 245 50, 270 50, 275 80 C 285 130, 290 110, 310 90 C 320 70, 345 70, 345 100 C 345 130, 340 180, 360 150 C 375 130, 395 140, 390 180 C 380 250, 410 320, 390 380 C 370 430, 300 460, 240 460 C 180 460, 140 430, 120 400 Z"
            fill="none"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth="1.5"
          />

          {/* Lines */}
          <path
            d={`M ${lines.heart.start.x} ${lines.heart.start.y} Q ${lines.heart.control.x} ${lines.heart.control.y} ${lines.heart.end.x} ${lines.heart.end.y}`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d={`M ${lines.head.start.x} ${lines.head.start.y} Q ${lines.head.control.x} ${lines.head.control.y} ${lines.head.end.x} ${lines.head.end.y}`}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="2.5"
            strokeOpacity="0.85"
            strokeLinecap="round"
          />
          <path
            d={`M ${lines.life.start.x} ${lines.life.start.y} Q ${lines.life.control.x} ${lines.life.control.y} ${lines.life.end.x} ${lines.life.end.y}`}
            fill="none"
            stroke="#D1D5DB"
            strokeWidth="2.5"
            strokeOpacity="0.85"
            strokeLinecap="round"
          />
          <path
            d={`M ${lines.fate.start.x} ${lines.fate.start.y} Q ${lines.fate.control.x} ${lines.fate.control.y} ${lines.fate.end.x} ${lines.fate.end.y}`}
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="2"
            strokeOpacity="0.7"
            strokeLinecap="round"
          />

          {/* Star markers */}
          <circle cx={lines.heart.start.x} cy={lines.heart.start.y} r="2" fill="#fff" />
          <circle cx={lines.heart.end.x} cy={lines.heart.end.y} r="2" fill="#fff" />
          <circle cx={lines.head.end.x} cy={lines.head.end.y} r="2" fill="#fff" />
          <circle cx={lines.life.end.x} cy={lines.life.end.y} r="2" fill="#fff" />

          <text x="250" y="485" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" letterSpacing="3">
            ХИРОМАНТИЯ
          </text>
        </svg>

        {/* Small Labels */}
        <div className="absolute top-4 left-4 text-[9px] tracking-wider text-zinc-600 font-mono">
          ID: {artworkId}
        </div>
        <div className="absolute bottom-4 right-4 text-[9px] tracking-wider text-zinc-600 font-mono">
          {currentDate}
        </div>
      </div>

      <p className="text-zinc-400 text-xs mt-3 font-light">
        {name ? `Имя: ${name}` : "Карта Ладони"}
      </p>

      {/* Download Buttons */}
      <div className="mt-6 flex flex-col gap-2 w-full px-4">
        <button
          onClick={downloadAsPNG}
          className={`w-full flex items-center justify-center gap-2 text-xs uppercase tracking-widest py-3 rounded-full transition font-medium border ${
            downloaded === "png"
              ? "bg-emerald-900/50 border-emerald-700 text-emerald-300"
              : "bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700 text-zinc-200"
          }`}
        >
          {downloaded === "png" ? (
            <>
              <Check size={14} />
              Сохранено
            </>
          ) : (
            <>
              <Image size={14} className="stroke-[1.5]" />
              Сохранить как PNG
            </>
          )}
        </button>
        <button
          onClick={downloadAsSVG}
          className={`w-full flex items-center justify-center gap-2 text-xs uppercase tracking-widest py-3 rounded-full transition font-medium border ${
            downloaded === "svg"
              ? "bg-emerald-900/50 border-emerald-700 text-emerald-300"
              : "bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700 text-zinc-200"
          }`}
        >
          {downloaded === "svg" ? (
            <>
              <Check size={14} />
              Сохранено
            </>
          ) : (
            <>
              <FileText size={14} className="stroke-[1.5]" />
              Сохранить как SVG
            </>
          )}
        </button>
      </div>
    </div>
  );
}

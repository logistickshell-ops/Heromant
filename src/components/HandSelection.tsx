import { ArrowRight, Check } from "lucide-react";

type Hand = "left" | "right";

interface HandSelectionProps {
  hand: Hand | null;
  onSelect: (hand: Hand) => void;
  onContinue: () => void;
}

const lineColors = { heart: "#fb7185", head: "#60a5fa", life: "#34d399", fate: "#a78bfa" };

function PalmIllustration({ side, selected }: { side: Hand; selected: boolean }) {
  const mirrored = side === "left";
  const transform = mirrored ? "translate(180 0) scale(-1 1)" : undefined;
  const stroke = selected ? "#ffffff" : "#a1a1aa";
  return (
    <svg viewBox="0 0 180 220" className="h-44 w-36" role="img" aria-label={`${mirrored ? "Левая" : "Правая"} ладонь вверх`}>
      <g transform={transform}>
        <path d="M74 205c-12-8-20-20-22-38l-6-50c-2-14 5-23 13-23 5 0 9 4 11 11l5 22V39c0-10 5-16 12-16s11 6 11 16v76h4V24c0-10 5-16 12-16s12 6 12 16v91h4l4-75c1-10 7-15 14-14 8 1 11 8 10 18l-5 74 8-45c2-10 8-15 15-13 8 2 10 10 8 20l-10 61c-3 18-12 32-28 43-13 9-26 13-43 13-13 0-25-3-34-9Z" fill={selected ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.025)"} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
        <path d="M70 111c18-10 38-13 61-9 13 2 24 7 35 14" fill="none" stroke={lineColors.heart} strokeWidth="3" strokeLinecap="round" />
        <path d="M66 126c22 1 42 8 58 18 10 6 20 9 30 7" fill="none" stroke={lineColors.head} strokeWidth="3" strokeLinecap="round" />
        <path d="M71 120c17 9 29 22 33 40 3 12 2 24-2 34" fill="none" stroke={lineColors.life} strokeWidth="3" strokeLinecap="round" />
        <path d="M108 198c-2-24 0-48 8-70" fill="none" stroke={lineColors.fate} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M64 139c-6 9-7 18-4 27" fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" opacity=".8" />
      </g>
    </svg>
  );
}

export default function HandSelection({ hand, onSelect, onContinue }: HandSelectionProps) {
  return (
    <section className="mx-auto flex min-h-[75vh] w-full max-w-2xl flex-col items-center justify-center bg-[#fdfdfb] px-4 py-10 text-[#111111]">
      <div className="mb-8 text-center">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-400">Шаг 2 из 4</p>
        <h2 className="text-2xl font-light uppercase tracking-[0.16em] text-zinc-800">Выберите ладонь</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-500">Положите ладонь вверх, пальцы расслабьте и выберите руку, которую фотографировали.</p>
      </div>

      <div className="grid w-full max-w-lg grid-cols-2 gap-3 sm:gap-5">
        {(["left", "right"] as Hand[]).map((side) => {
          const selected = hand === side;
          return (
            <button
              key={side}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(side)}
              className={`relative flex flex-col items-center rounded-3xl border-2 p-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 sm:p-5 ${selected ? "border-zinc-900 bg-zinc-900 text-white shadow-xl" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"}`}
            >
              {selected && <span className="absolute right-3 top-3 rounded-full bg-white p-1 text-zinc-900"><Check size={13} /></span>}
              {/* The source illustration is mirrored relative to the app's
                  camera convention, so deliberately use the opposite asset. */}
              <PalmIllustration side={side === "left" ? "right" : "left"} selected={selected} />
              <span className="text-xs font-semibold uppercase tracking-[0.18em]">{side === "left" ? "Левая" : "Правая"}</span>
              <span className={`mt-1 text-[10px] ${selected ? "text-zinc-300" : "text-zinc-400"}`}>{side === "left" ? "внутренний потенциал" : "реализованный путь"}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 w-full max-w-lg rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-center text-xs leading-relaxed text-zinc-500">
        {hand ? <><strong className="text-zinc-700">{hand === "left" ? "Левая" : "Правая"} ладонь</strong> выбрана. На следующем шаге можно будет поправить линии вручную.</> : "Обычно выбирают основную (рабочую) руку — ту, которой вы чаще пользуетесь."}
      </div>

      <button type="button" onClick={onContinue} disabled={!hand} className="mt-7 flex w-full max-w-lg items-center justify-center gap-2 rounded-xl bg-zinc-900 py-4 text-sm font-medium uppercase tracking-[0.14em] text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2">
        Далее <ArrowRight size={16} />
      </button>
    </section>
  );
}

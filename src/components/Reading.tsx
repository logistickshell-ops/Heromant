import { useEffect, useState } from "react";
import { Brain, ChevronDown, Compass, Eye, Globe, Heart, Lightbulb, RefreshCw, Sparkles, Zap } from "lucide-react";
import { FullAnalysis, LinesState, generateAnalysis } from "../utils/palmistryRules";
import HandArtwork from "./HandArtwork";

type HandType = "left" | "right";
interface ReadingProps { lines: LinesState; userName: string; hand: HandType; onRestart: () => void; }

type SectionId = "overall" | "heart" | "head" | "life" | "fate" | "traditions" | "advice";
const sections: Array<{ id: SectionId; label: string; icon: typeof Eye; color: string }> = [
  { id: "overall", label: "Общий рисунок", icon: Eye, color: "amber" },
  { id: "heart", label: "Сердце", icon: Heart, color: "rose" },
  { id: "head", label: "Голова", icon: Brain, color: "blue" },
  { id: "life", label: "Жизнь", icon: Zap, color: "emerald" },
  { id: "fate", label: "Судьба", icon: Compass, color: "violet" },
  { id: "traditions", label: "Традиции", icon: Globe, color: "cyan" },
  { id: "advice", label: "Ваш ориентир", icon: Lightbulb, color: "orange" },
];
const toneClasses: Record<string, string> = {
  amber: "border-amber-200 bg-amber-50 text-amber-600",
  rose: "border-rose-200 bg-rose-50 text-rose-600",
  blue: "border-blue-200 bg-blue-50 text-blue-600",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-600",
  violet: "border-violet-200 bg-violet-50 text-violet-600",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-600",
  orange: "border-orange-200 bg-orange-50 text-orange-600",
};

export default function Reading({ lines, userName, hand, onRestart }: ReadingProps) {
  const [analysis, setAnalysis] = useState<FullAnalysis | null>(null);
  const [isSimulating, setIsSimulating] = useState(true);
  const [loadingText, setLoadingText] = useState("Считываем узор ладони…");
  const [expandedSection, setExpandedSection] = useState<SectionId>("overall");

  useEffect(() => {
    const texts = ["Собираем точки рисунка…", "Смотрим на линии сердца и головы…", "Сверяем традиционные символы…", "Формируем личную карту…"];
    let index = 0;
    const interval = window.setInterval(() => {
      if (index < texts.length) { setLoadingText(texts[index]); index += 1; }
      else { window.clearInterval(interval); setAnalysis(generateAnalysis(lines)); setIsSimulating(false); }
    }, 850);
    return () => window.clearInterval(interval);
  }, [lines]);

  if (isSimulating) return <div className="flex min-h-[75vh] flex-col items-center justify-center bg-[#fdfdfb] p-6 text-center"><div className="relative mb-7 flex h-24 w-24 items-center justify-center rounded-full border border-amber-200 bg-amber-50/50"><div className="absolute inset-2 animate-spin rounded-full border border-transparent border-t-amber-600" /><Sparkles className="text-amber-600" size={25} strokeWidth={1.2} /></div><p aria-live="polite" className="text-sm uppercase tracking-[0.2em] text-zinc-600">{loadingText}</p><p className="mt-3 max-w-xs text-xs leading-relaxed text-zinc-400">Это символическая интерпретация для развлечения и саморефлексии.</p></div>;
  if (!analysis) return null;

  const content = (id: SectionId) => {
    switch (id) {
      case "overall": return <div className="space-y-4"><p className="text-[15px] leading-7 text-zinc-600">{analysis.overall}</p><div className="flex flex-wrap gap-2">{analysis.elements.map((element) => <span key={element} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800">{element}</span>)}</div><div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">Доминирующий мотив</p><p className="mt-1 text-sm leading-relaxed text-amber-950">{analysis.dominantElement}</p></div></div>;
      case "heart": return <LineReading title={analysis.heart.title} text={analysis.heart.description} />;
      case "head": return <LineReading title={analysis.head.title} text={analysis.head.description} />;
      case "life": return <LineReading title={analysis.life.title} text={analysis.life.description} />;
      case "fate": return <LineReading title={analysis.fate.title} text={analysis.fate.description} />;
      case "traditions": return <p className="text-[15px] leading-7 text-zinc-600">{analysis.compatibility}</p>;
      case "advice": return <div className="rounded-2xl bg-zinc-950 p-5 text-[15px] italic leading-7 text-white/85">«{analysis.advice}»</div>;
    }
  };

  return <section className="mx-auto w-full max-w-3xl bg-[#f7f5f0] px-4 py-8 text-zinc-900 sm:px-6 sm:py-12">
    <div className="relative overflow-hidden rounded-[2rem] bg-[#20191e] px-6 py-9 text-center text-white shadow-xl sm:px-12"><div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" /><div className="relative"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-amber-200/40 bg-amber-100/10 text-amber-200"><Sparkles size={20} /></div><p className="text-[10px] uppercase tracking-[0.3em] text-white/50">Личная карта {new Date().getFullYear()}</p><h1 className="mt-2 text-3xl font-extralight uppercase tracking-[0.16em]">{userName}</h1><p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/65">Ваши линии — не приговор, а повод внимательнее прислушаться к себе.</p><div className="mt-5 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] uppercase tracking-widest text-white/70">{hand === "left" ? "левая ладонь · внутренний потенциал" : "правая ладонь · реализованный путь"}</div></div></div>

    <div className="my-7 rounded-[2rem] bg-zinc-950 p-2 shadow-lg"><HandArtwork lines={lines} name={userName} /></div>

    <div className="mb-6 rounded-2xl border border-amber-200/80 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950"><strong>Помните:</strong> это развлекательная интерпретация традиций хиромантии, а не научная оценка личности, здоровья или будущего. Не принимайте на её основе важные решения.</div>

    <div className="space-y-3">{sections.map(({ id, label, icon: Icon, color }) => { const open = expandedSection === id; return <article key={id} className={`overflow-hidden rounded-2xl border transition-all ${open ? "border-zinc-200 bg-white shadow-sm" : "border-zinc-200/70 bg-white/55"}`}><button type="button" aria-expanded={open} onClick={() => setExpandedSection(open ? "overall" : id)} className="flex w-full items-center justify-between gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-inset"><span className="flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-full border ${toneClasses[color]}`}><Icon size={16} strokeWidth={1.7} /></span><span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-700">{label}</span></span><ChevronDown size={17} className={`text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} /></button>{open && <div className="border-t border-zinc-100 px-4 pb-5 pt-4">{content(id)}</div>}</article>; })}</div>

    <div className="mt-9 flex flex-col items-center gap-4"><button type="button" onClick={onRestart} className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-7 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-600 transition hover:border-zinc-900 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"><RefreshCw size={14} /> Пройти заново</button><p className="text-center text-[10px] leading-relaxed text-zinc-400">Интерпретации субъективны. Сохраните только те мысли, которые помогают вам сформулировать собственные цели.</p></div>
  </section>;
}

function LineReading({ title, text }: { title: string; text: string }) { return <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-800">{title}</p><p className="text-[15px] leading-7 text-zinc-600">{text}</p></div>; }

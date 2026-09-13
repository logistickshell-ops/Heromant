import { useEffect, useRef, useState } from "react";
import { Brain, ChevronDown, Compass, Download, Eye, FileDown, Globe, Heart, Lightbulb, RefreshCw, Sparkles, Zap, Pencil } from "lucide-react";
import { FullAnalysis, LinesState, generateAnalysis } from "../utils/palmistryRules";
import HandArtwork from "./HandArtwork";
import { downloadAnalysisPdf } from "../utils/pdfReport";

type HandType = "left" | "right";
interface ReadingProps { lines: LinesState; userName: string; hand: HandType; onRestart: () => void; onEdit: () => void; }

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

function lineCue(line: LinesState[keyof LinesState]) {
  const length = Math.hypot(line.end.x - line.start.x, line.end.y - line.start.y);
  const base = Math.max(1, length);
  const curve = Math.abs(line.start.x * (line.control.y - line.end.y) + line.control.x * (line.end.y - line.start.y) + line.end.x * (line.start.y - line.control.y)) / base;
  const angle = Math.atan2(line.end.y - line.start.y, line.end.x - line.start.x) * 180 / Math.PI;
  return `Длина: ${length < 170 ? "короткая" : length < 280 ? "средняя" : "заметная"} · изгиб: ${curve < 18 ? "почти прямой" : curve < 42 ? "мягкий" : "выраженный"} · направление: ${angle < -12 ? "нисходящее" : angle > 12 ? "восходящее" : "нейтральное"}`;
}

export default function Reading({ lines, userName, hand, onRestart, onEdit }: ReadingProps) {
  const [analysis, setAnalysis] = useState<FullAnalysis | null>(null);
  const [isSimulating, setIsSimulating] = useState(true);
  const [loadingText, setLoadingText] = useState("Считываем узор ладони…");
  const [expandedSection, setExpandedSection] = useState<SectionId>("overall");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const reportRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const texts = ["Собираем точки рисунка…", "Смотрим на линии сердца и головы…", "Сверяем традиционные символы…", "Формируем личную карту…"];
    let index = 0;
    const interval = window.setInterval(() => {
      if (index < texts.length) { setLoadingText(texts[index]); index += 1; }
      else { window.clearInterval(interval); setAnalysis(generateAnalysis(lines)); setIsSimulating(false); }
    }, 850);
    return () => window.clearInterval(interval);
  }, [lines]);

  if (isSimulating) return <div className="flex min-h-[75vh] flex-col items-center justify-center bg-[#f5f0e6] p-6 text-center"><div className="relative mb-7 flex h-24 w-24 items-center justify-center rounded-full border border-[#c99b4a] bg-[#21172b] text-[#dec17a]"><div className="absolute inset-2 animate-spin rounded-full border border-transparent border-t-[#c99b4a]" /><Sparkles size={25} strokeWidth={1.2} /></div><p aria-live="polite" className="text-sm uppercase tracking-[0.2em] text-[#21172b]">{loadingText}</p><p className="mt-3 max-w-xs text-xs leading-relaxed text-[#83798c]">Сова собирает символический рисунок — это не научный прогноз.</p></div>;
  if (!analysis) return null;

  const content = (id: SectionId) => {
    switch (id) {
      case "overall": return <div className="space-y-4"><p className="text-[15px] leading-7 text-zinc-600">{analysis.overall}</p><div className="flex flex-wrap gap-2">{analysis.elements.map((element) => <span key={element} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800">{element}</span>)}</div><div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">Доминирующий мотив</p><p className="mt-1 text-sm leading-relaxed text-amber-950">{analysis.dominantElement}</p></div></div>;
      case "heart": return <LineReading title={analysis.heart.title} text={analysis.heart.description} cue={lineCue(lines.heart)} />;
      case "head": return <LineReading title={analysis.head.title} text={analysis.head.description} cue={lineCue(lines.head)} />;
      case "life": return <LineReading title={analysis.life.title} text={analysis.life.description} cue={lineCue(lines.life)} />;
      case "fate": return <LineReading title={analysis.fate.title} text={analysis.fate.description} cue={lineCue(lines.fate)} />;
      case "traditions": return <p className="text-[15px] leading-7 text-zinc-600">{analysis.compatibility}</p>;
      case "advice": return <div className="rounded-2xl bg-zinc-950 p-5 text-[15px] italic leading-7 text-white/85">«{analysis.advice}»</div>;
    }
  };

  const handlePdf = async () => {
    if (!reportRef.current || isExporting) return;
    setIsExporting(true);
    try {
      setExportError(null);
      const safeName = userName.replace(/[^\p{L}\p{N}_-]+/gu, "-").replace(/^-+|-+$/g, "") || "putnik";
      await downloadAnalysisPdf(reportRef.current, `chiromant-${safeName}.pdf`);
    } catch {
      setExportError("Не удалось сохранить PDF. Попробуйте ещё раз или сохраните карту как PNG.");
    } finally {
      setIsExporting(false);
    }
  };

  return <section ref={reportRef} className="owl-reading mx-auto w-full max-w-3xl px-4 py-8 text-zinc-900 sm:px-6 sm:py-12">
    <div className="owl-reading-hero relative overflow-hidden rounded-[2rem] px-6 py-9 text-center text-white shadow-xl sm:px-12"><div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#c99b4a]/20 blur-3xl" /><div className="relative"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#dec17a]/50 bg-[#dec17a]/10 text-[#dec17a]"><span className="text-xl" aria-hidden="true">◉</span></div><p className="owl-eyebrow text-[10px] uppercase tracking-[0.3em]">Личная карта совы · {new Date().getFullYear()}</p><h1 className="mt-2 text-3xl font-extralight uppercase tracking-[0.16em]">{userName}</h1><p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/75">Ваши линии — не приговор, а повод внимательнее прислушаться к себе.</p><div className="mt-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] uppercase tracking-widest text-white/75">{hand === "left" ? "левая ладонь · наблюдение за собой" : "правая ладонь · наблюдение за собой"}</div></div></div>

    <div className="my-7 rounded-[2rem] bg-zinc-950 p-2 shadow-lg"><HandArtwork lines={lines} name={userName} /></div>

    <div className="owl-disclaimer mb-6 rounded-2xl border p-4 text-xs leading-relaxed"><strong>Памятка совы:</strong> это развлекательная интерпретация традиций хиромантии, а не оценка личности, здоровья или будущего. Сохраните только те мысли, которые помогают вам лучше сформулировать собственные вопросы.</div>

    <div className="space-y-3">{sections.map(({ id, label, icon: Icon, color }) => { const open = expandedSection === id; return <article key={id} className={`overflow-hidden rounded-2xl border transition-all ${open ? "border-zinc-200 bg-white shadow-sm" : "border-zinc-200/70 bg-white/55"}`}><button type="button" aria-expanded={open} onClick={() => setExpandedSection(open ? "overall" : id)} className="flex w-full items-center justify-between gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-inset"><span className="flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-full border ${toneClasses[color]}`}><Icon size={16} strokeWidth={1.7} /></span><span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-700">{label}</span></span><ChevronDown size={17} className={`text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} /></button>{open && <div className="border-t border-zinc-100 px-4 pb-5 pt-4">{content(id)}</div>}</article>; })}</div>

    <div className="mt-9 flex flex-col items-center gap-3"><div className="flex flex-wrap justify-center gap-3"><button type="button" onClick={handlePdf} disabled={isExporting} className="flex items-center gap-2 rounded-full bg-amber-700 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-amber-800 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700">{isExporting ? <Sparkles size={14} className="animate-spin" /> : <FileDown size={14} />} {isExporting ? "Готовим PDF…" : "Сохранить PDF"}</button><button type="button" onClick={onEdit} className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"><Pencil size={14} /> Изменить линии</button><button type="button" onClick={onRestart} className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-7 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-600 transition hover:border-zinc-900 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"><RefreshCw size={14} /> Пройти заново</button></div>{exportError && <p role="alert" className="text-xs text-red-700">{exportError}</p>}<p className="flex items-center gap-1 text-center text-[10px] leading-relaxed text-zinc-400"><Download size={12} /> PDF создаётся локально в браузере.</p><p className="text-center text-[10px] leading-relaxed text-zinc-400">Интерпретации субъективны. Сохраните только те мысли, которые помогают вам сформулировать собственные цели.</p></div>
  </section>;
}

function LineReading({ title, text, cue }: { title: string; text: string; cue: string }) { return <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-800">{title}</p><p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-amber-700">Почему так: {cue}</p><p className="text-[15px] leading-7 text-zinc-600">{text}</p><div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-xs leading-relaxed text-amber-950"><strong>Вопрос для себя:</strong> что в этом описании откликается вам сейчас — и что хочется рассмотреть иначе?</div></div>; }

import { useEffect, useState } from "react";
import { LinesState, generateAnalysis, FullAnalysis } from "../utils/palmistryRules";
import HandArtwork from "./HandArtwork";
import { Sparkles, Heart, Brain, Zap, Compass, RefreshCw, Globe, Lightbulb, Eye } from "lucide-react";

type HandType = "left" | "right";

interface ReadingProps {
  lines: LinesState;
  userName: string;
  hand: HandType;
  onRestart: () => void;
}

export default function Reading({ lines, userName, hand, onRestart }: ReadingProps) {
  const [analysis, setAnalysis] = useState<FullAnalysis | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [loadingText, setLoadingText] = useState<string>("Считывание энергии...");
  const [expandedSection, setExpandedSection] = useState<string>("overall");

  useEffect(() => {
    const texts = [
      "Сканирование точек соприкосновения...",
      "Анализ Линии Сердца и эмоционального баланса...",
      "Определение интеллектуального паттерна Линии Головы...",
      "Расчет жизненного потенциала Линии Жизни...",
      "Сверка с традициями мира — Индия, Китай, Тибет, Рим...",
      "Составление финальной проекции...",
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < texts.length) {
        setLoadingText(texts[index]);
        index++;
      } else {
        clearInterval(interval);
        setAnalysis(generateAnalysis(lines));
        setIsSimulating(false);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [lines]);

  if (isSimulating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center bg-[#FDFDFB]">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-20 h-20 border border-zinc-200 rounded-full animate-spin flex items-center justify-center border-t-zinc-800"></div>
          <Sparkles className="absolute text-zinc-400 animate-pulse stroke-[1]" size={24} />
        </div>
        <p className="text-sm tracking-widest text-zinc-500 uppercase animate-pulse">
          {loadingText}
        </p>
      </div>
    );
  }

  if (!analysis) return null;

  const sections = [
    { id: "overall", label: "Общий анализ", icon: <Eye size={16} /> },
    { id: "heart", label: "Сердце", icon: <Heart size={16} /> },
    { id: "head", label: "Голова", icon: <Brain size={16} /> },
    { id: "life", label: "Жизнь", icon: <Zap size={16} /> },
    { id: "fate", label: "Судьба", icon: <Compass size={16} /> },
    { id: "traditions", label: "Традиции мира", icon: <Globe size={16} /> },
    { id: "advice", label: "Совет", icon: <Lightbulb size={16} /> },
  ];

  const lineColors: Record<string, string> = {
    heart: "border-rose-400",
    head: "border-blue-400",
    life: "border-emerald-400",
    fate: "border-violet-400",
    overall: "border-amber-400",
    traditions: "border-cyan-400",
    advice: "border-orange-400",
  };

  const lineIcons: Record<string, React.ReactNode> = {
    heart: <Heart size={16} className="text-rose-500 stroke-[1.5]" />,
    head: <Brain size={16} className="text-blue-500 stroke-[1.5]" />,
    life: <Zap size={16} className="text-emerald-500 stroke-[1.5]" />,
    fate: <Compass size={16} className="text-violet-500 stroke-[1.5]" />,
    overall: <Sparkles size={16} className="text-amber-500 stroke-[1.5]" />,
    traditions: <Globe size={16} className="text-cyan-500 stroke-[1.5]" />,
    advice: <Lightbulb size={16} className="text-orange-500 stroke-[1.5]" />,
  };

  const sectionContent = (id: string) => {
    switch (id) {
      case "overall":
        return (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-zinc-600">{analysis.overall}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {analysis.elements.map((el, i) => (
                <span
                  key={i}
                  className="inline-block px-3 py-1.5 bg-zinc-50 border border-zinc-100 rounded-full text-[10px] font-semibold uppercase tracking-wider text-zinc-500"
                >
                  {el}
                </span>
              ))}
            </div>
            {analysis.dominantElement && (
              <div className="mt-3 p-3 bg-amber-50/50 border border-amber-100 rounded-lg">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-600 block mb-1">
                  Доминирующий элемент
                </span>
                <p className="text-sm text-amber-800">{analysis.dominantElement}</p>
              </div>
            )}
          </div>
        );
      case "heart":
        return (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-rose-600 mb-2">
              {analysis.heart.title}
            </p>
            <p className="text-sm text-zinc-500 leading-relaxed">{analysis.heart.description}</p>
          </div>
        );
      case "head":
        return (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
              {analysis.head.title}
            </p>
            <p className="text-sm text-zinc-500 leading-relaxed">{analysis.head.description}</p>
          </div>
        );
      case "life":
        return (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-2">
              {analysis.life.title}
            </p>
            <p className="text-sm text-zinc-500 leading-relaxed">{analysis.life.description}</p>
          </div>
        );
      case "fate":
        return (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-2">
              {analysis.fate.title}
            </p>
            <p className="text-sm text-zinc-500 leading-relaxed">{analysis.fate.description}</p>
          </div>
        );
      case "traditions":
        return (
          <p className="text-sm text-zinc-500 leading-relaxed">{analysis.compatibility}</p>
        );
      case "advice":
        return (
          <p className="text-sm text-zinc-500 leading-relaxed italic">«{analysis.advice}»</p>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 bg-[#FDFDFB] text-[#111111]">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-400 mb-1">
          Результат для
        </p>
        <h2 className="text-2xl font-light tracking-widest text-zinc-900 uppercase">
          {userName}
        </h2>
        <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-zinc-50 border border-zinc-100 rounded-full">
          <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-medium">
            {hand === "left" ? "✋ Левая ладонь — подсознание" : "🤚 Правая ладонь — сознание"}
          </span>
        </div>
        <div className="w-8 h-[1px] bg-zinc-300 mx-auto mt-3 mb-3"></div>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto font-light leading-relaxed">
          Хиромантия — это зеркало души. Позвольте себе глубоко прочувствовать это знание.
        </p>
      </div>

      {/* Artwork Display */}
      <HandArtwork lines={lines} name={userName} />

      {/* Accordion Sections */}
      <div className="mt-10 space-y-2 max-w-md mx-auto">
        {sections.map((section) => (
          <div
            key={section.id}
            className={`border rounded-xl overflow-hidden transition-all duration-300 ${
              expandedSection === section.id
                ? `border-zinc-200 bg-white shadow-sm`
                : "border-zinc-100 bg-zinc-50/50"
            }`}
          >
            <button
              onClick={() =>
                setExpandedSection(expandedSection === section.id ? "" : section.id)
              }
              className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-50 transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border ${lineColors[section.id]}`}
                >
                  {lineIcons[section.id]}
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-zinc-700">
                  {section.label}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${
                  expandedSection === section.id ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === section.id && (
              <div className="px-4 pb-5 pt-1 border-t border-zinc-100">
                {sectionContent(section.id)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Restart */}
      <div className="text-center mt-14 pb-8">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 text-xs font-medium border border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:border-zinc-400 transition py-3 px-8 rounded-full"
        >
          <RefreshCw size={14} />
          Пройти заново
        </button>
      </div>
    </div>
  );
}

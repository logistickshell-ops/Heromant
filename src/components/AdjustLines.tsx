import { useState, useRef, useEffect } from "react";
import { LinesState } from "../utils/palmistryRules";
import { Check, Info, CircleHelp, Sparkles, Wand2, Sliders, Volume2, VolumeX } from "lucide-react";
import PalmGuide from "./PalmGuide";
import { autoDetectLines, defaultLinesForHand } from "../utils/autoDetectLines";
import { playScanChime, startScanSound, stopScanSound } from "../utils/scanSound";

type Hand = "left" | "right";

interface AdjustLinesProps {
  image: string;
  hand: Hand;
  onConfirm: (lines: LinesState) => void;
  onBack: () => void;
}

interface DragState {
  lineKey: keyof LinesState;
  pointKey: "start" | "control" | "end";
}

export default function AdjustLines({ image, hand, onConfirm, onBack }: AdjustLinesProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [lines, setLines] = useState<LinesState | null>(null);
  const [activeLine, setActiveLine] = useState<keyof LinesState>("heart");
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [scanPhase, setScanPhase] = useState(0);

  // Дефолтные позиции линий - зависят от руки
  const defaultLines: LinesState = defaultLinesForHand[hand];

  useEffect(() => {
    if (!isDetecting) return;
    const started = startScanSound();
    setSoundEnabled(started);
    const phaseTimer = window.setInterval(() => {
      setScanPhase((phase) => (phase + 1) % 4);
      playScanChime();
    }, 900);
    return () => {
      window.clearInterval(phaseTimer);
      stopScanSound();
    };
  }, [isDetecting]);

  // Автоопределение при монтировании (если режим = auto)
  useEffect(() => {
    if (mode === "auto" && !lines) {
      setIsDetecting(true);
      setDetectError(false);
      autoDetectLines(image, hand).then((result) => {
        if (result) {
          setLines(result);
        } else {
          setLines(defaultLines);
          setDetectError(true);
        }
        setIsDetecting(false);
      });
    }
  }, []);

  // Переключение режима
  const switchMode = (newMode: "auto" | "manual") => {
    setMode(newMode);
    if (newMode === "manual") {
      setLines(defaultLines);
    } else {
      setIsDetecting(true);
      setDetectError(false);
      autoDetectLines(image, hand).then((result) => {
        if (result) {
          setLines(result);
        } else {
          setLines(defaultLines);
          setDetectError(true);
        }
        setIsDetecting(false);
      });
    }
  };

  const handleStartDrag = (lineKey: keyof LinesState, pointKey: "start" | "control" | "end") => {
    setActiveLine(lineKey);
    setDragging({ lineKey, pointKey });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!dragging || !svgRef.current || !lines) return;

    const rect = svgRef.current.getBoundingClientRect();
    let x = ((clientX - rect.left) / rect.width) * 500;
    let y = ((clientY - rect.top) / rect.height) * 500;
    x = Math.max(0, Math.min(500, x));
    y = Math.max(0, Math.min(500, y));

    setLines((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [dragging.lineKey]: {
          ...prev[dragging.lineKey],
          [dragging.pointKey]: { x, y },
        },
      };
    });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    const handleGlobalPointerUp = () => setDragging(null);
    window.addEventListener("pointerup", handleGlobalPointerUp);
    window.addEventListener("pointercancel", handleGlobalPointerUp);
    return () => {
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      window.removeEventListener("pointercancel", handleGlobalPointerUp);
    };
  }, []);

  const lineNames: Record<keyof LinesState, { title: string; desc: string; color: string }> = {
    heart: {
      title: "Линия Сердца",
      desc: "В традиции связана с эмоциональной стороной отношений. Начинается под мизинцем.",
      color: "#F43F5E",
    },
    head: {
      title: "Линия Головы",
      desc: "Традиционный символ способа думать и принимать решения. Идёт поперёк ладони.",
      color: "#3B82F6",
    },
    life: {
      title: "Линия Жизни",
      desc: "В традиции связана с запасом энергии и отношением к переменам, не со сроком жизни. Огибает большой палец.",
      color: "#10B981",
    },
    fate: {
      title: "Линия Судьбы",
      desc: "Традиционный образ жизненного направления и стремлений. Обычно вертикальна в центре.",
      color: "#8B5CF6",
    },
  };

  // Loading state
  if (isDetecting) {
    return (
      <div className="relative flex min-h-[75vh] flex-col items-center justify-center overflow-hidden bg-[#100c18] p-6 text-center text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.22),transparent_42%)]" />
        <div className="relative mb-8 flex h-40 w-40 items-center justify-center">
          <div className="absolute inset-0 animate-[spin_12s_linear_infinite] rounded-full border border-violet-300/30 border-dashed" />
          <div className="absolute inset-4 animate-[spin_7s_linear_infinite_reverse] rounded-full border border-amber-200/40" />
          <div className="absolute inset-10 animate-pulse rounded-full bg-violet-400/20 blur-xl" />
          <Wand2 className="relative z-10 text-amber-200 animate-pulse stroke-[1]" size={30} />
          {[0, 1, 2, 3].map((spark) => (
            <Sparkles key={spark} size={15} className={`absolute text-amber-200 animate-pulse ${spark === 0 ? "-top-1 left-1/2" : spark === 1 ? "top-1/2 -right-2" : spark === 2 ? "-bottom-1 left-1/2" : "top-1/2 -left-2"}`} style={{ animationDelay: `${spark * 180}ms` }} />
          ))}
        </div>
        <p aria-live="polite" className="relative text-sm tracking-[0.24em] text-violet-100 uppercase animate-pulse">
          Сканирую ладонь...
        </p>
        <p className="relative mt-3 max-w-xs text-xs leading-relaxed text-white/55">
          Ищу линии сердца, головы, жизни и судьбы на вашем снимке
        </p>
        <div className="relative mt-7 flex gap-2" aria-hidden="true">
          {[0, 1, 2, 3].map((step) => <span key={step} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step <= scanPhase ? "bg-amber-200 shadow-[0_0_12px_rgba(253,230,138,.8)]" : "bg-white/15"}`} />)}
        </div>
        <button type="button" onClick={() => { const started = startScanSound(); setSoundEnabled(started); }} className="relative mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-widest text-white/60 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200">
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />} {soundEnabled ? "Магический звук включён" : "Включить звук"}
        </button>
      </div>
    );
  }

  if (!lines) return null;

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto p-4 sm:p-6 bg-[#FDFDFB] text-[#111111] min-h-[85vh]">
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 bg-zinc-50 border border-zinc-100 rounded-full">
          <span className="text-sm">
            {hand === "left" ? "✋" : "🤚"}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
            {hand === "left" ? "Левая ладонь" : "Правая ладонь"}
          </span>
        </div>
        <h2 className="text-2xl font-light tracking-widest text-zinc-800 uppercase mb-2">
          Шаг 3: Калибровка линий
        </h2>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Подвигайте цветные точки, чтобы линии точно совпали с вашей ладонью.
        </p>
        <p className="text-[10px] text-zinc-400 max-w-sm mx-auto mt-1">
          {hand === "right"
              ? "Проверка: на правой ладони большой палец должен быть справа, мизинец слева."
              : "Проверка: на левой ладони большой палец должен быть слева, мизинец справа."}
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => switchMode("auto")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium tracking-wider uppercase transition-all ${
            mode === "auto"
              ? "bg-zinc-900 text-white shadow-sm"
              : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
          }`}
        >
          <Sparkles size={14} />
          Авто
        </button>
        <button
          onClick={() => switchMode("manual")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium tracking-wider uppercase transition-all ${
            mode === "manual"
              ? "bg-zinc-900 text-white shadow-sm"
              : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
          }`}
        >
          <Sliders size={14} />
          Вручную
        </button>
      </div>

      {/* Detection error notice */}
      {detectError && (
        <p className="text-xs text-zinc-400 mb-3 text-center max-w-xs">
          Не удалось точно определить линии. Установите их вручную, перетаскивая точки.
        </p>
      )}

      {/* Mini reference diagram */}
      <div className="flex items-center gap-3 mb-3 max-w-md">
        <div className="flex-shrink-0 w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-lg overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {hand === "right" ? (
              <>
                <path d="M 25 85 Q 20 60, 30 45 Q 35 35, 40 25 Q 45 15, 50 15 Q 55 15, 60 25 Q 65 35, 70 45 Q 80 60, 75 85 Q 70 95, 50 95 Q 30 95, 25 85 Z" fill="none" stroke="#d4d4d4" strokeWidth="1" />
                <path d="M 26 45 Q 50 35, 70 36" fill="none" stroke="#F43F5E" strokeWidth="1.5" />
                <path d="M 74 55 Q 50 64, 26 75" fill="none" stroke="#3B82F6" strokeWidth="1.5" />
                <path d="M 74 55 Q 44 69, 55 88" fill="none" stroke="#10B981" strokeWidth="1.5" />
                <path d="M 50 90 Q 50 65, 50 40" fill="none" stroke="#8B5CF6" strokeWidth="1.2" />
              </>
            ) : (
              <>
                <path d="M 75 85 Q 80 60, 70 45 Q 65 35, 60 25 Q 55 15, 50 15 Q 45 15, 40 25 Q 35 35, 30 45 Q 20 60, 25 85 Q 30 95, 50 95 Q 70 95, 75 85 Z" fill="none" stroke="#d4d4d4" strokeWidth="1" />
                <path d="M 74 45 Q 50 35, 30 36" fill="none" stroke="#F43F5E" strokeWidth="1.5" />
                <path d="M 26 55 Q 50 64, 74 75" fill="none" stroke="#3B82F6" strokeWidth="1.5" />
                <path d="M 26 55 Q 56 69, 45 88" fill="none" stroke="#10B981" strokeWidth="1.5" />
                <path d="M 50 90 Q 50 65, 50 40" fill="none" stroke="#8B5CF6" strokeWidth="1.2" />
              </>
            )}
          </svg>
        </div>
        <p className="text-[10px] text-zinc-400 leading-relaxed">
          <span className="text-zinc-500 font-medium">Схема:</span> розовая — сердце, синяя — голова, зелёная — жизнь, фиолетовая — судьба. Совместите цветные точки с линиями на вашей ладони.
        </p>
      </div>

      {/* SVG Interaction Area */}
      <div className="relative w-72 h-72 sm:w-[400px] sm:h-[400px] border border-zinc-100 bg-white rounded-2xl overflow-hidden shadow-sm touch-none">
        {/* Background Image stylized */}
        <img
          src={image}
          alt="Ладонь"
          className="absolute inset-0 w-full h-full object-cover select-none grayscale opacity-80 contrast-150"
        />

        {/* SVG overlay for lines and interactive points */}
        <svg
          ref={svgRef}
          viewBox="0 0 500 500"
          className="absolute inset-0 w-full h-full cursor-crosshair select-none touch-none"
          onMouseMove={onMouseMove}
          onTouchMove={onTouchMove}
          onPointerMove={(event) => handleMove(event.clientX, event.clientY)}
        >
          {/* Render the lines */}
          {(Object.keys(lines) as Array<keyof LinesState>).map((key) => {
            const data = lines[key];
            const isActive = activeLine === key;
            const strokeColor = lineNames[key].color;

            return (
              <path
                key={key}
                d={`M ${data.start.x} ${data.start.y} Q ${data.control.x} ${data.control.y} ${data.end.x} ${data.end.y}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={isActive ? 4 : 2}
                strokeOpacity={isActive ? 1 : 0.6}
                className="transition-all duration-150"
              />
            );
          })}

          {/* Render draggable control points */}
          {(Object.keys(lines) as Array<keyof LinesState>).map((lineKey) => {
            const data = lines[lineKey];
            const color = lineNames[lineKey].color;
            const points: Array<"start" | "control" | "end"> = ["start", "control", "end"];

            return points.map((pointKey) => {
              const p = data[pointKey];
              const isDragging =
                dragging?.lineKey === lineKey && dragging?.pointKey === pointKey;

              return (
                <circle
                  key={`${lineKey}-${pointKey}`}
                  cx={p.x}
                  cy={p.y}
                  r={isDragging ? 12 : 8}
                  fill="white"
                  stroke={color}
                  strokeWidth={2.5}
                  className="cursor-pointer transition-all duration-100 shadow-md"
                  role="slider"
                  aria-label={`${lineNames[lineKey].title}, ${pointKey === "control" ? "изгиб" : pointKey === "start" ? "начало" : "конец"}`}
                  aria-valuetext="Перетащите точку по линии ладони"
                  tabIndex={0}
                  onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    handleStartDrag(lineKey, pointKey);
                  }}
                />
              );
            });
          })}
        </svg>
      </div>

      {/* Info Box about selected line */}
      <div className="w-full mt-6 bg-zinc-50 border border-zinc-100 rounded-xl p-4 flex gap-3 items-start max-w-md">
        <Info size={18} className="text-zinc-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <span
            className="text-xs font-semibold uppercase tracking-wider block"
            style={{ color: lineNames[activeLine].color }}
          >
            {lineNames[activeLine].title}
          </span>
          <p className="text-xs text-zinc-500 mt-1">{lineNames[activeLine].desc}</p>
        </div>
        <button
          onClick={() => setShowGuide(true)}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-200 transition text-zinc-400 hover:text-zinc-600"
          title="Справка: Как читать ладонь"
        >
          <CircleHelp size={18} />
        </button>
      </div>

      {/* Selector pills */}
      <div className="flex flex-wrap gap-2 mt-4 justify-center max-w-md">
        {(Object.keys(lines) as Array<keyof LinesState>).map((key) => (
          <button
            key={key}
            onClick={() => setActiveLine(key)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-medium tracking-wide border transition uppercase ${
              activeLine === key
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
            }`}
          >
            {lineNames[key].title}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4 w-full px-4 max-w-md">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-4 border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 transition text-sm font-medium"
        >
          Назад
        </button>
        <button
          onClick={() => onConfirm(lines)}
          className="flex-1 bg-[#111111] text-white py-3 px-4 rounded-xl hover:bg-zinc-800 transition text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
        >
          <Check size={18} />
          Анализировать
        </button>
      </div>

      {/* Palm Guide Modal */}
      {showGuide && <PalmGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
}

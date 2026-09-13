import { useState } from "react";
import Welcome from "./components/Welcome";
import Capture from "./components/Capture";
import HandSelection from "./components/HandSelection";
import AdjustLines from "./components/AdjustLines";
import Reading from "./components/Reading";
import { LinesState } from "./utils/palmistryRules";

type Step = "welcome" | "capture" | "hand" | "adjust" | "reading";
type Hand = "left" | "right";

export default function App() {
  const [step, setStep] = useState<Step>("welcome");
  const [userName, setUserName] = useState<string>("");
  const [hand, setHand] = useState<Hand | null>(null);
  const [palmImage, setPalmImage] = useState<string | null>(null);
  const [lines, setLines] = useState<LinesState | null>(null);

  const handleStart = (name: string) => {
    setUserName(name);
    setStep("capture");
  };

  const handleCapture = (imageDataUrl: string) => {
    setPalmImage(imageDataUrl);
    setStep("hand");
  };

  const handleHandSelect = (selectedHand: Hand) => {
    setHand(selectedHand);
  };

  const handleHandContinue = () => {
    if (hand) setStep("adjust");
  };

  const handleLinesConfirm = (finalLines: LinesState) => {
    setLines(finalLines);
    setStep("reading");
  };

  const handleRestart = () => {
    setPalmImage(null);
    setLines(null);
    setHand(null);
    setStep("welcome");
  };

  const goBack = () => {
    if (step === "capture") setStep("welcome");
    else if (step === "hand") setStep("capture");
    else if (step === "adjust") setStep("hand");
    else if (step === "reading") setStep("adjust");
  };

  const stepLabels: Record<Step, string> = {
    welcome: "Начало",
    capture: "Снимок",
    hand: "Выбор руки",
    adjust: "Калибровка",
    reading: "Интерпретация",
  };

  return (
    <div className="owl-shell min-h-screen bg-[#F5F0E6] text-[#17121D] flex flex-col font-sans antialiased">
      {/* Global Minimalist Header */}
      <header className="owl-header border-b border-zinc-100/60 py-3 px-4 sm:px-6 flex justify-between items-center bg-[#FDFDFB]/80 backdrop-blur-md sticky top-0 z-50">
        <button
          type="button"
          className="text-xs font-light tracking-[0.25em] uppercase text-zinc-900 cursor-pointer"
          onClick={handleRestart}
          aria-label="Вернуться на главный экран"
        >
          <span className="owl-mark" aria-hidden="true">◉</span> СОВА · ХИРОМАНТ
        </button>
        <span className="text-[10px] font-medium tracking-widest text-zinc-400 uppercase">
          {stepLabels[step]}
        </span>
      </header>

      {/* Main Screen Content */}
      <main className="relative flex-grow flex flex-col justify-center overflow-hidden">
        <div key={step} className="step-portal relative">
          {step === "welcome" && <Welcome onStart={handleStart} />}

          {step === "capture" && <Capture onCapture={handleCapture} onBack={goBack} />}

          {step === "hand" && (
            <HandSelection
              hand={hand}
              onSelect={handleHandSelect}
              onContinue={handleHandContinue}
              onBack={goBack}
            />
          )}

          {step === "adjust" && palmImage && hand && (
            <AdjustLines
              image={palmImage}
              hand={hand}
              onConfirm={handleLinesConfirm}
              onBack={() => setStep("hand")}
            />
          )}

          {step === "reading" && lines && hand && (
            <Reading lines={lines} userName={userName} hand={hand} onRestart={handleRestart} onEdit={() => setStep("adjust")} />
          )}
        </div>
      </main>

      {/* Global Minimalist Footer */}
      <footer className="owl-footer border-t border-zinc-100/60 px-4 py-2.5 text-center">
        <p className="text-[9px] text-zinc-400 font-light tracking-widest uppercase">
          &copy; {new Date().getFullYear()} CHIROMANT — РАЗВЛЕКАТЕЛЬНАЯ ИНТЕРПРЕТАЦИЯ
        </p>
        <p className="mx-auto mt-1 max-w-xl text-[9px] leading-relaxed text-zinc-400">Не является научным методом, диагностикой или профессиональной рекомендацией. Фото обрабатываются локально.</p>
      </footer>
    </div>
  );
}

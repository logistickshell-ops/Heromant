import { useEffect } from "react";
import { X } from "lucide-react";

interface PalmGuideProps {
  onClose: () => void;
}

type GuideHand = "left" | "right";

const lineColors = {
  heart: "#F43F5E",
  head: "#3B82F6",
  life: "#10B981",
  fate: "#8B5CF6",
  sun: "#EAB308",
  mercury: "#A855F7",
};

function HandDiagram({ hand }: { hand: GuideHand }) {
  const isLeft = hand === "left";
  const transform = isLeft ? "translate(220 0) scale(-1 1)" : undefined;

  return (
    <svg viewBox="0 0 220 260" className="w-full">
      <g transform={transform}>
        <path
          d="M 104 246 C 72 246, 51 225, 50 194 C 49 166, 42 132, 37 103 C 34 83, 48 77, 58 94 C 64 105, 69 123, 72 137 L 72 66 C 72 45, 88 44, 92 65 L 98 132 L 101 43 C 102 20, 121 20, 123 43 L 126 132 L 135 58 C 139 39, 156 41, 155 61 L 149 137 C 164 119, 180 109, 191 118 C 204 129, 194 150, 179 164 C 164 179, 157 196, 157 214 C 157 234, 136 246, 104 246 Z"
          fill="rgba(0,0,0,0.02)"
          stroke="#d4d4d4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.3"
        />
        <path d="M 62 116 Q 108 94 152 96" fill="none" stroke={lineColors.heart} strokeLinecap="round" strokeWidth="4" />
        <path d="M 154 134 Q 108 152 58 176" fill="none" stroke={lineColors.head} strokeLinecap="round" strokeWidth="4" />
        <path d="M 153 132 Q 96 168 126 227" fill="none" stroke={lineColors.life} strokeLinecap="round" strokeWidth="4" />
        <path d="M 108 230 Q 107 168 111 108" fill="none" stroke={lineColors.fate} strokeLinecap="round" strokeWidth="3" />
        <path d="M 84 178 L 123 164" fill="none" opacity="0.9" stroke={lineColors.sun} strokeLinecap="round" strokeWidth="3" />
        <path d="M 80 214 L 132 178" fill="none" opacity="0.75" stroke={lineColors.mercury} strokeLinecap="round" strokeWidth="3" />
      </g>
      <text x={isLeft ? 36 : 184} y="84" fill="#71717a" fontSize="8" textAnchor="middle">
        мизинец
      </text>
      <text x={isLeft ? 184 : 36} y="84" fill="#71717a" fontSize="8" textAnchor="middle">
        большой
      </text>
      <text x="110" y="255" fill="#a1a1aa" fontSize="8" textAnchor="middle">
        {isLeft ? "левая: большой палец слева" : "правая: большой палец справа"}
      </text>
    </svg>
  );
}

export default function PalmGuide({ onClose }: PalmGuideProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const primaryLines = [
    {
      key: "heart" as const,
      title: "Линия сердца",
      text: "Верхняя дуга под пальцами. Идёт от стороны мизинца к зоне между указательным и средним пальцами. В традиции её связывают с эмоциональной стороной отношений.",
    },
    {
      key: "head" as const,
      title: "Линия головы",
      text: "Средняя линия. Обычно стартует у промежутка между большим и указательным пальцами рядом с линией жизни и проходит через ладонь к внешнему краю. Традиционный символ способа думать и принимать решения.",
    },
    {
      key: "life" as const,
      title: "Линия жизни",
      text: "Большая дуга вокруг основания большого пальца. Стартует между большим и указательным пальцами и спускается к запястью. В традиции — символ запаса энергии и отношения к переменам, а не срока жизни.",
    },
    {
      key: "fate" as const,
      title: "Линия судьбы",
      text: "Вертикальная или наклонная линия от запястья к центру ладони; может отсутствовать. В традиции — образ жизненного направления и стремлений.",
    },
  ];

  const extraSigns = [
    "Звезда под указательным пальцем: амбиции, лидерство, стремление к признанию.",
    "Треугольник в центре ладони: интуиция, мудрость, нестандартные решения.",
    "Вилки на линиях: важные развилки, переезды, смена стратегии.",
    "Круги на линиях: периоды переосмысления и внутренней трансформации.",
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="bg-[#FDFDFB] rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="palm-guide-title">
        <div className="flex items-center justify-between p-5 pb-3 border-b border-zinc-100 sticky top-0 bg-[#FDFDFB] z-10 rounded-t-3xl">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">Гид по хиромантии</p>
            <h3 id="palm-guide-title" className="text-sm font-light tracking-widest uppercase text-zinc-800">Чтение вашей ладони</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 transition text-zinc-400 hover:text-zinc-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="bg-white border border-zinc-100 rounded-2xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-700">Тип руки</p>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">Огонь и воздух: активность, идеи, скорость реакции. Земля и вода: устойчивость, чувствительность, глубина восприятия.</p>
            </div>
            <div className="bg-white border border-zinc-100 rounded-2xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-700">Форма ладони</p>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">Прямоугольная ладонь чаще указывает на движение и коммуникацию. Квадратная - на практичность, порядок и надёжность.</p>
            </div>
            <div className="bg-white border border-zinc-100 rounded-2xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-700">Пальцы</p>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">Длинные пальцы дают внимание к деталям. Короткие - быстрые решения. Гибкость пальцев показывает адаптивность.</p>
            </div>
          </div>

          <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3 text-center">Проверка ориентации ладони</p>
            <div className="grid grid-cols-2 gap-4">
              <HandDiagram hand="right" />
              <HandDiagram hand="left" />
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed mt-3 text-center">
              В этом приложении используется зеркальный ракурс камеры. Правая рука: большой палец справа, мизинец слева. Левая рука: большой палец слева, мизинец справа.
            </p>
          </div>

          <div className="grid md:grid-cols-[1fr_1.35fr_1fr] gap-4">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Основные линии</p>
              {primaryLines.map((line) => (
                <div key={line.key} className="bg-white border border-zinc-100 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-[2px] rounded" style={{ backgroundColor: lineColors[line.key] }} />
                    <p className="text-[11px] font-semibold text-zinc-700">{line.title}</p>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed mt-2">{line.text}</p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-zinc-100 rounded-2xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-center mb-3">Ваша ладонь</p>
              <HandDiagram hand="right" />
              <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-zinc-500">
                <p><span className="text-rose-500">1</span> Линия сердца</p>
                <p><span className="text-blue-500">2</span> Линия головы</p>
                <p><span className="text-emerald-500">3</span> Линия жизни</p>
                <p><span className="text-violet-500">4</span> Линия судьбы</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Дополнительные знаки</p>
              {extraSigns.map((item) => (
                <div key={item} className="bg-white border border-zinc-100 rounded-xl p-3">
                  <p className="text-[10px] text-zinc-500 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="bg-white border border-zinc-100 rounded-2xl p-4 md:col-span-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-700">Общая интерпретация</p>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">Сначала смотрим форму руки, затем четыре основные линии, затем дополнительные знаки. Финальный вывод строится только по сочетанию признаков.</p>
            </div>
            <div className="bg-white border border-zinc-100 rounded-2xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-700">Сильные стороны</p>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">Аналитический ум, коммуникабельность, решительность, интуиция и творческий подход читаются по балансу линий.</p>
            </div>
            <div className="bg-white border border-zinc-100 rounded-2xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-700">Рекомендация</p>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">Используйте чтение как карту, а не как приговор. Если автолиния не совпала с реальной складкой, поправьте её вручную.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-900">
            <strong>Важно:</strong> это развлекательная интерпретация и повод для саморефлексии. Хиромантия не является научным методом, диагностикой или предсказанием будущего и не заменяет профессиональные рекомендации.
          </div>
        </div>

        <div className="p-5 pt-2 sticky bottom-0 bg-[#FDFDFB]">
          <button
            onClick={onClose}
            className="w-full bg-[#111111] text-white text-xs font-medium tracking-widest uppercase py-3.5 rounded-xl hover:bg-zinc-800 transition"
          >
            Понятно, продолжить
          </button>
        </div>
      </div>
    </div>
  );
}

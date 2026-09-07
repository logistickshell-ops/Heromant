import React from "react";
import { ArrowRight } from "lucide-react";

interface WelcomeProps {
  onStart: (name: string) => void;
}

const fallbackNames = ["Искатель", "Созерцатель", "Наблюдатель", "Странник", "Хранитель", "Путешественник"];

export default function Welcome({ onStart }: WelcomeProps) {
  const [name, setName] = React.useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanName = name.trim();
    const fallback = fallbackNames[Math.floor(Math.random() * fallbackNames.length)];
    onStart(cleanName || fallback);
  };

  return (
    <section className="welcome-hero relative isolate flex min-h-[calc(100svh-65px)] items-start overflow-hidden bg-[#160f18] text-white">
      <img
        src="/hero-chiromant.jpg"
        alt="Хиромантка читает линии ладони в мистической библиотеке"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 -z-10 bg-black/35" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/20 via-transparent to-black/75" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-14 pt-12 sm:px-8 sm:pt-16 lg:px-12">
        <div className="max-w-lg">
          <p className="welcome-kicker mb-4 text-[10px] font-medium uppercase tracking-[0.32em] text-white/65">
            Чтение линий ладони
          </p>
          <h1 className="welcome-title text-6xl font-normal leading-[0.88] tracking-[-0.04em] text-white sm:text-8xl">
            Хиромант Вероничка
          </h1>
          <p className="mt-6 max-w-sm text-sm font-light leading-7 text-white/78 sm:text-base">
            Ваша ладонь хранит личный узор. Сделайте снимок и взгляните на него как на символическую карту характера и выбора.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 max-w-md">
            <label htmlFor="name" className="sr-only">Ваше имя</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ваше имя"
                maxLength={25}
                autoComplete="given-name"
                className="min-w-0 flex-1 rounded-xl border border-white/30 bg-black/25 px-4 py-3.5 text-sm text-white outline-none backdrop-blur-sm transition placeholder:text-white/55 focus:border-white focus:ring-2 focus:ring-white/25"
              />
              <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-900 transition hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                Открыть карту <ArrowRight size={16} />
              </button>
            </div>
          </form>

          <p className="mt-5 max-w-md text-[10px] leading-relaxed text-white/58">
            Развлекательная интерпретация традиций хиромантии. Не является диагностикой или предсказанием будущего. Фото остаётся на вашем устройстве.
          </p>
        </div>
      </div>
    </section>
  );
}

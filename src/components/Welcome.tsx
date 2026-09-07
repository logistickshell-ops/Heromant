import React from "react";
import { ArrowRight, Eye, Sparkles } from "lucide-react";

interface WelcomeProps {
  onStart: (name: string) => void;
}

export default function Welcome({ onStart }: WelcomeProps) {
  const [name, setName] = React.useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onStart(name.trim() || "Путник");
  };

  return (
    <section className="relative isolate flex min-h-[calc(100svh-73px)] items-center overflow-hidden bg-[#160f18] text-white">
      <img
        src="/hero-chiromant.jpg"
        alt="Хиромантка читает линии ладони в мистической библиотеке"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(17,10,18,0.12)_0%,rgba(17,10,18,0.24)_28%,rgba(17,10,18,0.94)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_26%,rgba(255,179,78,0.2),transparent_36%)]" />
      <div className="magic-orbit magic-orbit-one" aria-hidden="true" />
      <div className="magic-orbit magic-orbit-two" aria-hidden="true" />
      <div className="magic-dust magic-dust-one" aria-hidden="true" />
      <div className="magic-dust magic-dust-two" aria-hidden="true" />

      <div className="mx-auto w-full max-w-6xl px-5 pb-14 pt-16 sm:px-8 sm:pb-20 sm:pt-20 lg:px-12">
        <div className="max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-white/75 backdrop-blur-sm">
            <Eye size={14} strokeWidth={1.4} />
            Врата тайного узора
          </div>
          <h1 className="text-5xl font-extralight uppercase leading-[0.95] tracking-[0.12em] text-white drop-shadow-lg sm:text-7xl">
            Хиромант
          </h1>
          <p className="mt-5 max-w-md text-sm font-light leading-relaxed text-white/75 sm:text-base">
            Ладонь хранит узор мгновений — тонкую карту выборов, чувств и дорог, которые вы открываете сами. Позвольте свету свечей провести вас по этим знакам: сделайте снимок, настройте линии и раскройте свою личную символическую карту.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 max-w-md rounded-2xl border border-white/20 bg-black/30 p-3 shadow-2xl backdrop-blur-md sm:p-4">
            <label htmlFor="name" className="sr-only">Ваше имя</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ваше имя (необязательно)"
                maxLength={25}
                autoComplete="given-name"
                className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-amber-200 focus:ring-2 focus:ring-amber-200/30"
              />
              <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-900 transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200">
                Открыть карту <ArrowRight size={16} />
              </button>
            </div>
          </form>

          <p className="mt-5 max-w-md text-[10px] leading-relaxed text-white/55">
            Обряд создан для развлечения и тихой саморефлексии. Это символическое чтение традиций, а не научный метод, диагностика или предсказание будущего; оно не заменяет медицинские, психологические и финансовые рекомендации. Фотография остаётся на вашем устройстве.
          </p>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-5 right-6 hidden items-center gap-2 text-[9px] uppercase tracking-[0.28em] text-white/40 sm:flex">
        <Sparkles size={13} /> Тайна начинается с прикосновения
      </div>
    </section>
  );
}

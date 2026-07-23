import ButtonLink from "@/components/ui/ButtonLink";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f6faf8] to-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        {/* Left: message */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#e9f8f3] px-3 py-1 text-xs font-semibold text-[#168c56]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#20ad68]" />
            AI pronunciation coaching
          </span>

          <h1 className="mt-6 font-display text-5xl leading-[1.05] text-[#17223b] md:text-6xl">
            Speak English <span className="text-[#20ad68]">clearly.</span>
            <br />
            Keep your own voice.
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-gray-600">
            Master the sounds that make you hard to understand — without losing
            who you are. Personalized lessons and instant feedback from Nina,
            your patient AI coach.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/register">Start free assessment</ButtonLink>
            <ButtonLink href="/courses" variant="outline">
              How it works
            </ButtonLink>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-gray-600">
            <Trust label="Expert-built lessons" />
            <Trust label="Private & secure" />
            <Trust label="Coaching 24/7" />
          </div>
        </div>

        {/* Right: gradient showcase panel */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#20ad68] via-[#178a57] to-[#142b4c] p-8 text-white shadow-xl">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-white/5" />

            <div className="relative rounded-2xl bg-white/10 p-6 backdrop-blur">
              <div className="tracking-widest text-amber-300">★★★★★</div>
              <p className="mt-3 font-display text-lg leading-snug">
                “For the first time, people understand me on the first try — and
                I still sound like me.”
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 font-semibold">
                  SN
                </div>
                <div>
                  <p className="font-semibold">Samuel N.</p>
                  <p className="text-xs text-white/70">Student · Cameroon</p>
                </div>
              </div>
            </div>

            <div className="relative mt-6 grid grid-cols-3 gap-4">
              <Metric value="120+" label="countries" />
              <Metric value="40" label="languages" />
              <Metric value="+31%" label="avg. clarity" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Trust({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#20ad68"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
      {label}
    </span>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-white/70">{label}</p>
    </div>
  );
}

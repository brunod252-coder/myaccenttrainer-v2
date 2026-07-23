import Link from "next/link";

import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export default function CallToAction() {
  return (
    <Section>
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#20ad68] via-[#178a57] to-[#142b4c] px-8 py-16 text-center text-white shadow-xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-white/5" />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl md:text-4xl">
              Transform your English pronunciation today
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-white/80">
              Join learners from around the world and start building confidence
              in your English pronunciation — with Nina by your side.
            </p>

            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-white px-7 py-3 text-sm font-semibold text-[#168c56] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
              >
                Start free assessment
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

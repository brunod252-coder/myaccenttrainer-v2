import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";

const benefits = [
  {
    number: "01",
    title: "Hear the difference",
    description:
      "Use focused listening and pronunciation practice to recognize the sounds that shape clear American English.",
  },
  {
    number: "02",
    title: "Practice with purpose",
    description:
      "Work through lessons at your own pace and return to difficult sounds whenever you need more practice.",
  },
  {
    number: "03",
    title: "See your progress",
    description:
      "Keep your learning organized as you complete lessons, practice pronunciation, and build confidence over time.",
  },
];

export default function Testimonials() {
  return (
    <Section className="pt-0">
      <Container>
        <SectionHeader
          eyebrow="Built for real progress"
          title="A clearer path to confident English"
          subtitle="MyAccentTrainer combines structured lessons, focused practice, and progress tracking in one learning experience."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map((benefit) => (
            <article
              key={benefit.number}
              className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9f8f3] text-sm font-bold text-[#20ad68]">
                {benefit.number}
              </div>

              <h3 className="mt-5 font-display text-xl text-[#17223b]">
                {benefit.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-[#dcefe7] bg-[#f6faf8] px-6 py-7 text-center">
          <p className="font-display text-xl text-[#17223b]">
            Our pilot is where the real numbers begin.
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            As learners use MyAccentTrainer, we will measure progress and publish
            genuine learner experiences instead of placeholder testimonials or
            unsupported statistics.
          </p>
        </div>
      </Container>
    </Section>
  );
}

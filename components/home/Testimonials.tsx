import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import TestimonialCard from "@/components/cards/TestimonialCard";

const testimonials = [
  {
    name: "Maria",
    country: "Brazil",
    quote: "The lessons made English pronunciation much easier to understand.",
  },
  {
    name: "Ahmed",
    country: "Egypt",
    quote: "I finally feel confident speaking English at work.",
  },
  {
    name: "Samuel",
    country: "Cameroon",
    quote:
      "The Basic Lessons completely changed the way I pronounce English words.",
  },
];

const stats = [
  { value: "10,000+", label: "learners" },
  { value: "120+", label: "countries" },
  { value: "4.9/5", label: "average rating" },
];

export default function Testimonials() {
  return (
    <Section className="pt-0">
      <Container>
        <SectionHeader
          eyebrow="Loved worldwide"
          title="What our students say"
          subtitle="Students from around the world have improved their confidence through MyAccentTrainer."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.name}
              name={testimonial.name}
              country={testimonial.country}
              quote={testimonial.quote}
            />
          ))}
        </div>

        <div className="mt-10 grid gap-6 rounded-2xl border border-gray-100 bg-[#f6faf8] p-8 text-center sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-3xl text-[#20ad68]">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

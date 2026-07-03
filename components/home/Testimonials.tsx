import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import TestimonialCard from "@/components/cards/TestimonialCard";

const testimonials = [
  {
    name: "Maria",
    country: "Brazil",
    quote:
      "The lessons made English pronunciation much easier to understand.",
  },
  {
    name: "Ahmed",
    country: "Egypt",
    quote:
      "I finally feel confident speaking English at work.",
  },
  {
    name: "Samuel",
    country: "Cameroon",
    quote:
      "The Basic Lessons completely changed the way I pronounce English words.",
  },
];

export default function Testimonials() {
  return (
    <Section className="pt-0">
      <Container>
        <SectionHeader
          title="What Our Students Say"
          subtitle="Students from around the world have improved their confidence through My Accent Trainer."
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
      </Container>
    </Section>
  );
}
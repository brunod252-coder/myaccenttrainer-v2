import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import CourseCard from "@/components/cards/CourseCard";

const courses = [
  {
    title: "Basic Lessons",
    description:
      "The foundation of the program, where you learn to make the sounds of a neutral English accent.",
  },
  {
    title: "Pronunciation Tips",
    description:
      "Commonly used words, pronunciation tips, and practice selections for clearer spoken English.",
  },
  {
    title: "Life in America",
    description:
      "Everyday vocabulary for common situations — the doctor, restaurants, travel, and more.",
  },
  {
    title: "TOEFL Preparation",
    description:
      "Concise strategies and practice support to help raise your TOEFL speaking scores.",
  },
  {
    title: "Professional Vocabulary",
    description:
      "Words from business, engineering, healthcare, and other professional fields.",
  },
  {
    title: "Student Word Lists",
    description:
      "Word lists submitted by subscribers and private lesson students.",
  },
];

export default function CourseGrid() {
  return (
    <Section className="pt-0">
      <Container>
        <SectionHeader
          eyebrow="Courses"
          title="A course for every step"
          subtitle="Meticulously designed courses, each tailored to sharpen your English pronunciation and comprehension."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.title}
              title={course.title}
              description={course.description}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}

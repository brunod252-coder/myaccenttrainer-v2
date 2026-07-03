import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import CourseCard from "@/components/cards/CourseCard";

const courses = [
  {
    title: "Basic Lessons",
    description:
      "The Basic Lessons are the foundation of the VoiceTown program where you learn to make the sounds of a neutral English accent.",
  },
  {
    title: "Pronunciation Tips",
    description:
      "Lists of commonly used words, pronunciation tips, and practice selections for clearer spoken English.",
  },
  {
    title: "Life in America",
    description:
      "Common vocabulary terms used in everyday situations such as going to the doctor, eating in a restaurant, travel, and more.",
  },
  {
    title: "TOEFL Preparation",
    description:
      "Concise strategies and practice support to help raise TOEFL speaking scores.",
  },
  {
    title: "Professional Vocabularies",
    description:
      "Words from business, accounting, chemistry, engineering, statistics, and other professional fields.",
  },
  {
    title: "Student Submitted Word Lists",
    description:
      "Word lists submitted by subscribers and private lesson students.",
  },
];

export default function CourseGrid() {
  return (
    <Section className="pt-0">
      <Container>
        <SectionHeader
          title="Explore My Accent Trainer's Comprehensive Courses"
          subtitle="Dive into our range of meticulously designed courses, each tailored to enhance your English pronunciation and comprehension."
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
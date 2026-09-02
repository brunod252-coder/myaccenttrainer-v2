import CourseCard from "@/components/cards/CourseCard";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";

const courses = [
  {
    title: "Basic Lessons",
    description:
      "The foundation of the program, where you learn to make the sounds of a neutral English accent.",
    imageSrc: "/course-images/basic-lessons.jpg",
    imageAlt: "Learner studying independently with a laptop",
    href: "/courses#basic-lessons",
  },
  {
    title: "Pronunciation Tips",
    description:
      "Commonly used words, pronunciation tips, and practice selections for clearer spoken English.",
    imageSrc: "/course-images/pronunciation-tips.jpg",
    imageAlt: "Learners practicing conversation together",
    href: "/courses#pronunciation-tips",
  },
  {
    title: "Life in America",
    description:
      "Everyday vocabulary for common situations — the doctor, restaurants, travel, and more.",
    imageSrc: "/course-images/life-in-america.png",
    imageAlt: "International learners together in a community setting",
    href: "/courses#life-in-america",
  },
  {
    title: "TOEFL Preparation",
    description:
      "Concise strategies and practice support to help raise your TOEFL speaking scores.",
    imageSrc: "/course-images/toefl-preparation.jpeg",
    imageAlt: "Student receiving academic guidance while studying",
    href: "/courses#toefl-preparation",
  },
  {
    title: "Professional Vocabulary",
    description:
      "Words from business, engineering, healthcare, and other professional fields.",
    imageSrc: "/course-images/professional-vocabulary.jpg",
    imageAlt: "Adult learner working on a laptop",
    href: "/courses#professional-vocabulary",
  },
  {
    title: "Student Word Lists",
    description:
      "Word lists submitted by subscribers and private lesson students.",
    imageSrc: "/course-images/student-word-lists.jpg",
    imageAlt: "Students walking together with books and study materials",
    href: "/courses#student-word-lists",
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
              imageSrc={course.imageSrc}
              imageAlt={course.imageAlt}
              href={course.href}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}

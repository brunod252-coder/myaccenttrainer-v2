import Image from "next/image";
import Link from "next/link";

import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import {
  getMarketingDestination,
  getMarketingSessionUser,
} from "@/lib/auth/marketing-session";

const courses = [
  {
    id: "basic-lessons",
    title: "Basic Lessons",
    imageSrc: "/course-images/basic-lessons.jpg",
    imageAlt: "Learner studying independently with a laptop",
    status: "Available now",
    available: true,
    description:
      "Build the foundation of clear American English pronunciation. Work through Nina's core sound lessons at your own pace, listen carefully, practice each target sound, and track your progress lesson by lesson.",
    highlights: [
      "Structured pronunciation lessons",
      "Listen, practice, and repeat at your own pace",
      "Nina's pronunciation feedback",
      "Lesson completion and progress tracking",
    ],
  },
  {
    id: "pronunciation-tips",
    title: "Pronunciation Tips",
    imageSrc: "/course-images/pronunciation-tips.jpg",
    imageAlt: "Learners practicing conversation together",
    status: "Dedicated course coming soon",
    available: false,
    description:
      "Focused guidance for commonly used words, difficult sound combinations, stress, rhythm, and everyday pronunciation patterns.",
    highlights: [
      "Practical pronunciation guidance",
      "Commonly used words and phrases",
      "Speech clarity and rhythm",
      "Short, focused practice",
    ],
  },
  {
    id: "life-in-america",
    title: "Life in America",
    imageSrc: "/course-images/life-in-america.png",
    imageAlt: "International learners together in a community setting",
    status: "Dedicated course coming soon",
    available: false,
    description:
      "English for everyday situations in the United States, including appointments, restaurants, travel, community life, and other practical conversations.",
    highlights: [
      "Everyday American English",
      "Real-life vocabulary",
      "Common social situations",
      "Practical communication practice",
    ],
  },
  {
    id: "toefl-preparation",
    title: "TOEFL Preparation",
    imageSrc: "/course-images/toefl-preparation.jpeg",
    imageAlt: "Student receiving academic guidance while studying",
    status: "Dedicated course coming soon",
    available: false,
    description:
      "Speaking-focused preparation designed to build clearer answers, stronger pronunciation, and more confident delivery for academic English.",
    highlights: [
      "Speaking practice",
      "Pronunciation and clarity",
      "Structured answer delivery",
      "Academic English confidence",
    ],
  },
  {
    id: "professional-vocabulary",
    title: "Professional Vocabulary",
    imageSrc: "/course-images/professional-vocabulary.jpg",
    imageAlt: "Adult learner working on a laptop",
    status: "Dedicated course coming soon",
    available: false,
    description:
      "Pronunciation and vocabulary practice for professional communication across fields such as business, engineering, healthcare, and other careers.",
    highlights: [
      "Career-focused vocabulary",
      "Professional pronunciation",
      "Workplace communication",
      "Field-specific language practice",
    ],
  },
  {
    id: "student-word-lists",
    title: "Student Word Lists",
    imageSrc: "/course-images/student-word-lists.jpg",
    imageAlt: "Students walking together with books and study materials",
    status: "Dedicated course coming soon",
    available: false,
    description:
      "A growing collection of words and phrases drawn from the real pronunciation needs of MyAccentTrainer learners and private lesson students.",
    highlights: [
      "Learner-requested vocabulary",
      "Targeted pronunciation practice",
      "Useful words and phrases",
      "Growing practice library",
    ],
  },
];

export default async function CourseDetails() {
  const user =
    await getMarketingSessionUser();

  const learningHref =
    user
      ? user.role === "ADMIN"
        ? "/admin"
        : "/dashboard/courses"
      : "/register";

  const learningLabel =
    user
      ? user.role === "ADMIN"
        ? "Go to Admin"
        : "Start this course"
      : "Start learning";

  const generalDestination =
    getMarketingDestination(user);

  return (
    <Section className="pt-4">
      <Container>
        <div className="mx-auto max-w-5xl space-y-10">
          {courses.map((course, index) => (
            <article
              key={course.id}
              id={course.id}
              className="scroll-mt-28 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
            >
              <div
                className={`grid md:grid-cols-2 ${
                  index % 2 === 1
                    ? "md:[&>*:first-child]:order-2"
                    : ""
                }`}
              >
                <div className="relative min-h-64 md:min-h-80">
                  <Image
                    src={course.imageSrc}
                    alt={course.imageAlt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col justify-center p-8 md:p-10">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#20ad68]">
                      Course
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        course.available
                          ? "bg-[#e9f8f3] text-[#168c56]"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>

                  <h2 className="mt-4 font-display text-3xl text-[#17223b]">
                    {course.title}
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-gray-600">
                    {course.description}
                  </p>

                  <ul className="mt-6 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                    {course.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-start gap-2"
                      >
                        <span className="text-[#20ad68]">
                          ✓
                        </span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    {course.available ? (
                      <Link
                        href={learningHref}
                        className="inline-flex rounded-lg bg-[#20ad68] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#169357]"
                      >
                        {learningLabel}
                      </Link>
                    ) : (
                      <Link
                        href={generalDestination}
                        className="inline-flex rounded-lg border border-[#20ad68] px-5 py-3 text-sm font-semibold text-[#168c56] transition hover:bg-[#e9f8f3]"
                      >
                        {user
                          ? user.role === "ADMIN"
                            ? "Go to Admin"
                            : "Continue learning"
                          : "Explore MyAccentTrainer"}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}

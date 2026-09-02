import type { Metadata } from "next";

import MarketingLayout from "@/components/layouts/MarketingLayout";
import PageBanner from "@/components/marketing/PageBanner";
import CourseGrid from "@/components/home/CourseGrid";
import CourseDetails from "@/components/home/CourseDetails";
import CallToAction from "@/components/home/CallToAction";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Explore MyAccentTrainer's courses — from core sounds to rhythm, fluency, and academic English.",
};

export default function CoursesPage() {
  return (
    <MarketingLayout>
      <PageBanner
        eyebrow="Courses"
        title="Explore our courses"
        subtitle="Explore the complete MyAccentTrainer curriculum."
      />

      <CourseGrid />

      <CourseDetails />

      <CallToAction />
    </MarketingLayout>
  );
}

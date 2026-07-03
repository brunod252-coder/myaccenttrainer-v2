import MarketingLayout from "@/components/layouts/MarketingLayout";
import PageBanner from "@/components/marketing/PageBanner";
import CourseGrid from "@/components/home/CourseGrid";
import CallToAction from "@/components/home/CallToAction";

export default function CoursesPage() {
  return (
    <MarketingLayout>
      <PageBanner
        title="Courses"
        subtitle="Explore the complete My Accent Trainer curriculum."
      />

      <CourseGrid />

      <CallToAction />
    </MarketingLayout>
  );
}
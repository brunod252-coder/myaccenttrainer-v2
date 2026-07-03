import MarketingLayout from "@/components/layouts/MarketingLayout";

import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import CourseGrid from "@/components/home/CourseGrid";
import PricingPreview from "@/components/home/PricingPreview";
import Testimonials from "@/components/home/Testimonials";
import CallToAction from "@/components/home/CallToAction";

export default function Home() {
  return (
    <MarketingLayout>
      <Hero />
      <Features />
      <CourseGrid />
      <PricingPreview />
      <Testimonials />
      <CallToAction />
    </MarketingLayout>
  );
}
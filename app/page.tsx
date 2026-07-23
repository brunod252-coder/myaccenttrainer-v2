import type { Metadata } from "next";

import MarketingLayout from "@/components/layouts/MarketingLayout";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import CourseGrid from "@/components/home/CourseGrid";
import PricingPreview from "@/components/home/PricingPreview";
import Testimonials from "@/components/home/Testimonials";
import CallToAction from "@/components/home/CallToAction";

export const metadata: Metadata = {
  description:
    "Speak English clearly and keep your own voice. Personalized pronunciation lessons and instant feedback from Nina, your patient AI coach.",
};

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

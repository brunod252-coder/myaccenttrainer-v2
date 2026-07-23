import type { Metadata } from "next";

import MarketingLayout from "@/components/layouts/MarketingLayout";
import PageBanner from "@/components/marketing/PageBanner";
import PricingPreview from "@/components/home/PricingPreview";
import CallToAction from "@/components/home/CallToAction";
import { getSettings } from "@/lib/content/content";

export const metadata: Metadata = {
  title: "Prices",
  description:
    "Simple, flexible pricing for MyAccentTrainer — everything you need to sound clear and confident.",
};

export default async function PricesPage() {
  const settings = await getSettings();
  return (
    <MarketingLayout>
      <PageBanner
        eyebrow="Pricing"
        title={settings.pricing_headline}
        subtitle={settings.pricing_subtitle}
      />

      <PricingPreview />

      <CallToAction />
    </MarketingLayout>
  );
}

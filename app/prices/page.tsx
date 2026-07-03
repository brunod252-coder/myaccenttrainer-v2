import MarketingLayout from "@/components/layouts/MarketingLayout";
import PageBanner from "@/components/marketing/PageBanner";
import PricingPreview from "@/components/home/PricingPreview";
import CallToAction from "@/components/home/CallToAction";

export default function PricesPage() {
  return (
    <MarketingLayout>
      <PageBanner
        title="Prices"
        subtitle="Choose the plan that fits your English pronunciation journey."
      />

      <PricingPreview />

      <CallToAction />
    </MarketingLayout>
  );
}
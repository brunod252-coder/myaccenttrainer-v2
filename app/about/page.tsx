import MarketingLayout from "@/components/layouts/MarketingLayout";
import PageBanner from "@/components/marketing/PageBanner";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import CallToAction from "@/components/home/CallToAction";

export default function AboutPage() {
  return (
    <MarketingLayout>
      <PageBanner
        title="About"
        subtitle="My Accent Trainer helps learners speak English with clarity, confidence, and practical pronunciation support."
      />

      <Section>
        <Container>
          <div className="mx-auto max-w-3xl space-y-6 text-sm leading-7 text-gray-700">
            <p>
              My Accent Trainer was created to help English learners understand
              and practice the sounds of clear spoken English.
            </p>

            <p>
              The platform preserves Nina&apos;s teaching approach while giving
              students a structured way to study pronunciation, vocabulary,
              TOEFL preparation, and everyday English.
            </p>

            <p>
              Version 2 is being rebuilt as MAT Core: a modern platform designed
              to make learning easier for students and teaching simpler for Nina.
            </p>
          </div>
        </Container>
      </Section>

      <CallToAction />
    </MarketingLayout>
  );
}
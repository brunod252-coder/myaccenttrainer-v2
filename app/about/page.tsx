import type { Metadata } from "next";

import MarketingLayout from "@/components/layouts/MarketingLayout";
import PageBanner from "@/components/marketing/PageBanner";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import CallToAction from "@/components/home/CallToAction";

export const metadata: Metadata = {
  title: "About",
  description:
    "MyAccentTrainer helps learners speak English clearly and confidently — with patient, practical coaching from Nina.",
};

export default function AboutPage() {
  return (
    <MarketingLayout>
      <PageBanner
        eyebrow="Our story"
        title="Clarity, confidence, and your own voice"
        subtitle="MyAccentTrainer helps learners speak English clearly and confidently — with practical, patient pronunciation coaching from Nina."
      />

      <Section>
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="font-display text-2xl leading-relaxed text-[#17223b]">
              MyAccentTrainer was created to help English learners understand and
              practice the sounds of clear spoken English — without losing what
              makes their voice their own.
            </p>

            <div className="mt-8 space-y-6 leading-8 text-gray-600">
              <p>
                The platform preserves Nina&apos;s teaching approach — encourage
                first, explain clearly, and invite another attempt — while giving
                students a structured way to study pronunciation, vocabulary, TOEFL
                preparation, and everyday English.
              </p>
              <p>
                Every lesson follows the same gentle rhythm: learn, listen,
                practice, get feedback, and celebrate. You move at your own pace,
                and Nina meets you exactly where you are.
              </p>
              <p>
                We&apos;re building a modern platform designed to make learning
                easier for students and teaching simpler for Nina — so clear,
                confident English is within everyone&apos;s reach.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <CallToAction />
    </MarketingLayout>
  );
}

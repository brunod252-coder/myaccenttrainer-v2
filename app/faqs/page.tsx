import type { Metadata } from "next";

import MarketingLayout from "@/components/layouts/MarketingLayout";
import PageBanner from "@/components/marketing/PageBanner";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { getFaqs } from "@/lib/content/content";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Answers to common questions about MyAccentTrainer.",
};

export default async function FAQsPage() {
  const faqs = await getFaqs();
  return (
    <MarketingLayout>
      <PageBanner eyebrow="Help" title="Frequently asked questions" subtitle="Answers to common questions about MyAccentTrainer." />
      <Section>
        <Container>
          <div className="mx-auto max-w-3xl space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="font-display text-lg text-[#17223b]">{faq.question}</h2>
                <p className="mt-2 text-sm leading-7 text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </MarketingLayout>
  );
}

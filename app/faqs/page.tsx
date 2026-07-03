import MarketingLayout from "@/components/layouts/MarketingLayout";
import PageBanner from "@/components/marketing/PageBanner";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

const faqs = [
  {
    question: "What is My Accent Trainer?",
    answer:
      "My Accent Trainer is a pronunciation learning platform designed to help English learners speak more clearly and confidently.",
  },
  {
    question: "Who are the lessons for?",
    answer:
      "The lessons are for English learners who want to improve pronunciation, vocabulary, TOEFL speaking, or professional communication.",
  },
  {
    question: "Can I study at my own pace?",
    answer:
      "Yes. Students can work through the lessons at a pace that fits their schedule.",
  },
  {
    question: "Does My Accent Trainer replace private lessons?",
    answer:
      "No. It supports learning through structured lessons and practice materials, while still preserving Nina's teaching approach.",
  },
];

export default function FAQsPage() {
  return (
    <MarketingLayout>
      <PageBanner
        title="FAQs"
        subtitle="Answers to common questions about My Accent Trainer."
      />

      <Section>
        <Container>
          <div className="mx-auto max-w-3xl space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="border bg-white p-6 shadow-sm">
                <h2 className="font-bold text-[#20ad68]">{faq.question}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-700">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </MarketingLayout>
  );
}
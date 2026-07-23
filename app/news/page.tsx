import type { Metadata } from "next";

import MarketingLayout from "@/components/layouts/MarketingLayout";
import PageBanner from "@/components/marketing/PageBanner";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { getNews } from "@/lib/content/content";

export const metadata: Metadata = {
  title: "News",
  description: "Announcements and learning notes from MyAccentTrainer.",
};

export default async function NewsPage() {
  const posts = await getNews();
  return (
    <MarketingLayout>
      <PageBanner eyebrow="News" title="Updates from MyAccentTrainer" subtitle="Announcements and learning notes as the platform grows." />
      <Section>
        <Container>
          <div className="mx-auto grid max-w-4xl gap-6">
            {posts.map((post) => (
              <article key={post.id} className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <span className="inline-block rounded-full bg-[#e9f1f6] px-3 py-1 text-xs font-semibold text-[#52719f]">{post.dateLabel || "Update"}</span>
                <h2 className="mt-3 font-display text-xl text-[#17223b]">{post.title}</h2>
                <p className="mt-2 text-sm leading-7 text-gray-600">{post.excerpt}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>
    </MarketingLayout>
  );
}

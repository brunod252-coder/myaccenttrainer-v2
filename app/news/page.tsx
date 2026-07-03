import MarketingLayout from "@/components/layouts/MarketingLayout";
import PageBanner from "@/components/marketing/PageBanner";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

const posts = [
  {
    title: "Welcome to My Accent Trainer Version 2",
    excerpt:
      "A modern foundation is being built to preserve Nina's lessons while making the platform easier to use and maintain.",
    date: "June 29, 2026",
  },
  {
    title: "Clear English Starts With Sound",
    excerpt:
      "The Basic Lessons help students understand the sounds that shape clear spoken English.",
    date: "Coming Soon",
  },
];

export default function NewsPage() {
  return (
    <MarketingLayout>
      <PageBanner
        title="News"
        subtitle="Updates, announcements, and learning notes from My Accent Trainer."
      />

      <Section>
        <Container>
          <div className="mx-auto grid max-w-4xl gap-6">
            {posts.map((post) => (
              <article key={post.title} className="border bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold text-gray-500">{post.date}</p>
                <h2 className="mt-2 text-xl font-bold text-[#20ad68]">
                  {post.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-gray-700">
                  {post.excerpt}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </Section>
    </MarketingLayout>
  );
}
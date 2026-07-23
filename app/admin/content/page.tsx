import AdminLayout from "@/components/admin/AdminLayout";
import ListManager from "@/components/admin/ListManager";
import LessonManager from "@/components/admin/LessonManager";
import PricingForm from "@/components/admin/PricingForm";
import { requireAdmin } from "@/lib/auth/admin";
import { getFaqs, getNews, getCourses, getSettings } from "@/lib/content/content";
import { listCustomLessons } from "@/lib/lessons/custom";

export default async function AdminContent() {
  const admin = await requireAdmin();
  const [faqs, news, courses, settings, customLessons] = await Promise.all([
    getFaqs({ adminAll: true }),
    getNews({ adminAll: true }),
    getCourses(),
    getSettings(),
    listCustomLessons({ adminAll: true }),
  ]);
  const adminName = [admin.firstName, admin.lastName].filter(Boolean).join(" ") || admin.email;

  return (
    <AdminLayout admin={{ name: adminName }}>
      <h1 className="font-display text-3xl text-[#17223b]">Content</h1>
      <p className="mt-1 text-sm text-gray-500">Manage what appears on your public pages — no code required. Empty lists fall back to sensible defaults.</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <ListManager
          endpoint="/api/admin/content/faq"
          heading="FAQ"
          blurb="Questions shown on the public FAQ page."
          fields={[{ name: "question", label: "Question" }, { name: "answer", label: "Answer", textarea: true }]}
          items={faqs.map((f) => ({ id: f.id, published: f.published, question: f.question, answer: f.answer }))}
          publishKey="published"
        />
        <ListManager
          endpoint="/api/admin/content/news"
          heading="News"
          blurb="Announcements shown on the public News page."
          fields={[{ name: "title", label: "Title" }, { name: "excerpt", label: "Excerpt", textarea: true }, { name: "dateLabel", label: "Date label (e.g. “June 2026”)" }]}
          items={news.map((n) => ({ id: n.id, published: n.published, title: n.title, excerpt: n.excerpt, dateLabel: n.dateLabel }))}
          publishKey="published"
        />
        <ListManager
          endpoint="/api/admin/content/course"
          heading="Courses"
          blurb="Course catalog entries."
          fields={[{ name: "title", label: "Title" }, { name: "description", label: "Description", textarea: true }]}
          items={courses.map((c) => ({ id: c.id, published: c.isPublished, title: c.title, description: c.description || "" }))}
          publishKey="isPublished"
        />
        <PricingForm headline={settings.pricing_headline} subtitle={settings.pricing_subtitle} />

        <div className="lg:col-span-2">
          <LessonManager
            items={customLessons.map((l) => ({ id: l.id, subtitle: l.subtitle, referenceText: l.referenceText, focus: l.focus, description: l.description, published: l.published, hasAudio: Boolean(l.audioBase64) }))}
          />
        </div>
      </div>
    </AdminLayout>
  );
}

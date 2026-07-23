// ── Site content (admin-managed) ─────────────────────────────────────
// FAQ, news, pricing copy, and courses. Guarded reads with sensible
// defaults so public pages always render, even before migration.

import { prisma } from "@/lib/prisma";

export type Faq = { id: string; question: string; answer: string; published: boolean };
export type News = { id: string; title: string; excerpt: string; dateLabel: string; published: boolean };
export type CourseRow = { id: string; title: string; description: string | null; isPublished: boolean };

const DEFAULT_FAQS: Faq[] = [
  { id: "d1", question: "What is MyAccentTrainer?", answer: "A pronunciation coaching platform that helps English learners speak more clearly and confidently — without losing their own voice.", published: true },
  { id: "d2", question: "Who are the lessons for?", answer: "Anyone improving their spoken English — students, professionals, and newcomers who want to be understood the first time.", published: true },
  { id: "d3", question: "Can I study at my own pace?", answer: "Yes. Work through lessons whenever suits you — five minutes or fifty. Nina remembers where you left off.", published: true },
  { id: "d4", question: "Do I need special equipment?", answer: "Just a browser and a microphone. You record right on the page — no apps to install.", published: true },
];

const DEFAULT_NEWS: News[] = [
  { id: "n1", title: "Welcome to MyAccentTrainer", excerpt: "Nina's coaching, now on a modern platform built to grow with you.", dateLabel: "June 2026", published: true },
  { id: "n2", title: "Clear English starts with sound", excerpt: "Our sound-by-sound lessons target exactly what makes you hard to understand.", dateLabel: "Coming soon", published: true },
];

const DEFAULT_SETTINGS: Record<string, string> = {
  pricing_headline: "One plan. Everything included.",
  pricing_subtitle: "Unlimited lessons, feedback from Nina, progress tracking, and certificates — cancel anytime.",
};

function db() {
  return prisma as unknown as {
    faqItem: { findMany: (a?: unknown) => Promise<Faq[]>; create: (a: unknown) => Promise<unknown>; update: (a: unknown) => Promise<unknown>; delete: (a: unknown) => Promise<unknown> };
    newsPost: { findMany: (a?: unknown) => Promise<News[]>; create: (a: unknown) => Promise<unknown>; update: (a: unknown) => Promise<unknown>; delete: (a: unknown) => Promise<unknown> };
    siteSetting: { findMany: (a?: unknown) => Promise<{ key: string; value: string }[]>; upsert: (a: unknown) => Promise<unknown> };
    course: { findMany: (a?: unknown) => Promise<CourseRow[]>; create: (a: unknown) => Promise<unknown>; update: (a: unknown) => Promise<unknown>; delete: (a: unknown) => Promise<unknown> };
  };
}

export async function getFaqs(opts?: { adminAll?: boolean }): Promise<Faq[]> {
  try {
    const rows = await db().faqItem.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
    if (!rows.length) return opts?.adminAll ? [] : DEFAULT_FAQS;
    return opts?.adminAll ? rows : rows.filter((r) => r.published);
  } catch {
    return opts?.adminAll ? [] : DEFAULT_FAQS;
  }
}

export async function getNews(opts?: { adminAll?: boolean }): Promise<News[]> {
  try {
    const rows = await db().newsPost.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
    if (!rows.length) return opts?.adminAll ? [] : DEFAULT_NEWS;
    return opts?.adminAll ? rows : rows.filter((r) => r.published);
  } catch {
    return opts?.adminAll ? [] : DEFAULT_NEWS;
  }
}

export async function getSettings(): Promise<Record<string, string>> {
  const out = { ...DEFAULT_SETTINGS };
  try {
    const rows = await db().siteSetting.findMany();
    for (const r of rows) out[r.key] = r.value;
  } catch { /* defaults */ }
  return out;
}

export async function getCourses(): Promise<CourseRow[]> {
  try {
    return await db().course.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { id: true, title: true, description: true, isPublished: true } });
  } catch {
    return [];
  }
}

// ── admin mutations (best-effort; guarded) ──
export async function createFaq(question: string, answer: string) { try { await db().faqItem.create({ data: { question, answer } }); } catch {} }
export async function deleteFaq(id: string) { try { await db().faqItem.delete({ where: { id } }); } catch {} }
export async function toggleFaq(id: string, published: boolean) { try { await db().faqItem.update({ where: { id }, data: { published } }); } catch {} }

export async function createNews(title: string, excerpt: string, dateLabel: string) { try { await db().newsPost.create({ data: { title, excerpt, dateLabel } }); } catch {} }
export async function deleteNews(id: string) { try { await db().newsPost.delete({ where: { id } }); } catch {} }
export async function toggleNews(id: string, published: boolean) { try { await db().newsPost.update({ where: { id }, data: { published } }); } catch {} }

export async function setSetting(key: string, value: string) { try { await db().siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } }); } catch {} }

export async function createCourse(title: string, description: string) { try { await db().course.create({ data: { title, slug: slugify(title), description } }); } catch {} }
export async function deleteCourse(id: string) { try { await db().course.delete({ where: { id } }); } catch {} }
export async function toggleCourse(id: string, isPublished: boolean) { try { await db().course.update({ where: { id }, data: { isPublished } }); } catch {} }

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "course-" + Math.abs(hash(s));
}
function hash(s: string): number { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }

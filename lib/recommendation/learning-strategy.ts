import { TimelineEntry } from "@/lib/learner-timeline/learner-timeline-repository";

export function determineNextLesson(
  timeline: TimelineEntry[]
): string {
  const completed = new Set(
    timeline.map((entry) => entry.lessonSlug)
  );

  if (!completed.has("the-american-th")) {
    return "the-american-th";
  }

  if (!completed.has("american-r")) {
    return "american-r";
  }

  if (!completed.has("linking")) {
    return "linking";
  }

  if (!completed.has("intonation")) {
    return "intonation";
  }

  return "conversation-practice";
}

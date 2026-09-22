// ── Nina's Coaching Engine ───────────────────────────────────────────
// Turns Nina Brain + analytics + the learner's goal into a daily plan,
// personalized exercises, weekly/monthly reviews, and goal tracking.

import { getNinaBrain } from "@/lib/nina/brain";
import { getAnalytics } from "@/lib/analytics/insights";
import {
  getLearningProfile,
  getLessonRecommendationForFocus,
  getMissionLessonRecommendations,
  type LearningLevel,
  type LearningMission,
} from "@/lib/learning";
import { getGoal, type Goal } from "@/lib/nina/goals";

export type Exercise = { focus: string; label: string; slug: string; why: string };

export type Review = {
  attemptsThisPeriod: number;
  attemptsLastPeriod: number;
  deltaPct: number | null;
  summary: string;
};

export type CoachingPlan = {
  hasData: boolean;
  mission: LearningMission;
  level: LearningLevel;
  headline: string;
  motivation: string;
  focusLabel: string | null;
  exercises: Exercise[];
  goal: Goal;
  daysThisWeek: number;
  goalMet: boolean;
  streakDays: number;
  practicedToday: boolean;
  weekReview: Review;
  monthReview: { thisMonth: string; attempts: number; avg: number } | null;
  clarityNow: number | null;
  clarityTargetProgress: number | null; // 0..100 toward clarity target
};

function exFor(focus: string, why: string): Exercise | null {
  const lesson = getLessonRecommendationForFocus(focus);
  if (!lesson) return null;

  return {
    focus: lesson.focus,
    label: lesson.label,
    slug: lesson.slug,
    why,
  };
}

export async function getCoachingPlan(userId: string): Promise<CoachingPlan> {
  const [brain, analytics, goal, learningProfile] = await Promise.all([
    getNinaBrain(userId),
    getAnalytics(userId),
    getGoal(userId),
    getLearningProfile(userId),
  ]);

  // Weekly practice days from the calendar (last 7 vs previous 7).
  const cal = analytics.calendar;
  const last7 = cal.slice(-7);
  const prev7 = cal.slice(-14, -7);
  const daysThisWeek = last7.filter((d) => d.count > 0).length;
  const attemptsThisWeek = last7.reduce((s, d) => s + d.count, 0);
  const attemptsLastWeek = prev7.reduce((s, d) => s + d.count, 0);
  const practicedToday = (cal[cal.length - 1]?.count ?? 0) > 0;
  const goalMet = daysThisWeek >= goal.weeklyTarget;

  const weekDelta =
    attemptsLastWeek > 0 ? Math.round(((attemptsThisWeek - attemptsLastWeek) / attemptsLastWeek) * 100) : null;
  const weekReview: Review = {
    attemptsThisPeriod: attemptsThisWeek,
    attemptsLastPeriod: attemptsLastWeek,
    deltaPct: weekDelta,
    summary:
      attemptsThisWeek === 0
        ? "No practice yet this week — a single 5-minute session gets you moving."
        : weekDelta === null
          ? `A strong start: ${attemptsThisWeek} recording${attemptsThisWeek === 1 ? "" : "s"} this week.`
          : weekDelta >= 0
            ? `Up ${weekDelta}% on last week — ${attemptsThisWeek} recordings. Momentum is building.`
            : `A quieter week (${attemptsThisWeek} recordings, down ${Math.abs(weekDelta)}%). Let's get back on track.`,
  };

  const monthReview =
    analytics.months.length > 0
      ? {
          thisMonth: analytics.months[analytics.months.length - 1].label,
          attempts: analytics.months[analytics.months.length - 1].attempts,
          avg: analytics.months[analytics.months.length - 1].avg,
        }
      : null;

  // Build today's exercises.
  const exercises: Exercise[] = [];
  if (!brain.hasData) {
    const recommendations = getMissionLessonRecommendations(
      learningProfile.mission,
      3,
    );

    for (const recommendation of recommendations) {
      const why =
        recommendation.source === "fallback"
          ? "A strong pronunciation foundation while Nina learns more about your speech."
          : `Selected for your ${learningProfile.mission.shortLabel} goal — ${learningProfile.mission.priorities[0]}.`;

      const e = exFor(recommendation.focus, why);

      if (e && !exercises.some((x) => x.slug === e.slug)) {
        exercises.push(e);
      }
    }
  } else {
    if (brain.weakest) {
      const e = exFor(brain.weakest.focus, `This is your lowest-scoring focus right now (${brain.weakest.avg} avg), so Nina is prioritizing it for practice.`);
      if (e) exercises.push(e);
    }
    // next-lowest rated sounds
    const lowFirst = [...brain.sounds].sort((a, b) => a.avg - b.avg);
    for (const s of lowFirst) {
      if (exercises.length >= 2) break;
      if (brain.weakest && s.focus === brain.weakest.focus) continue;
      const e = exFor(s.focus, s.delta < 0 ? `Slipped ${Math.abs(s.delta)} lately — worth a revisit.` : `Keep building — currently ${s.avg}.`);
      if (e) exercises.push(e);
    }
    // one "keep sharp" warm-up from the strongest
    if (brain.strongest) {
      const e = exFor(brain.strongest.focus, `Warm up on a strength (${brain.strongest.avg}) to start confident.`);
      if (e && !exercises.some((x) => x.slug === e.slug)) exercises.push(e);
    }
  }

  const focusLabel = exercises[0]?.label ?? null;
  const headline = practicedToday
    ? "You've practiced today — beautiful."
    : brain.hasData
      ? `Today's focus: ${focusLabel ?? "your next sound"}`
      : learningProfile.mission.key === "general"
        ? "Let's begin your first session"
        : learningProfile.mission.headline;

  const motivation = brain.hasData
    ? pickMotivation(
        brain.streakDays,
        goalMet,
        practicedToday,
        brain.hasData,
      )
    : learningProfile.mission.key === "general"
      ? pickMotivation(
          brain.streakDays,
          goalMet,
          practicedToday,
          brain.hasData,
        )
      : `You're starting at the ${learningProfile.level} level. Today's session is built around your ${learningProfile.mission.label} goal.`;

  const clarityTargetProgress =
    goal.clarityTarget && brain.clarity !== null
      ? Math.min(100, Math.round((brain.clarity / goal.clarityTarget) * 100))
      : null;

  return {
    hasData: brain.hasData,
    mission: learningProfile.mission,
    level: learningProfile.level,
    headline,
    motivation,
    focusLabel,
    exercises: exercises.slice(0, 3),
    goal,
    daysThisWeek,
    goalMet,
    streakDays: brain.streakDays,
    practicedToday,
    weekReview,
    monthReview,
    clarityNow: brain.clarity,
    clarityTargetProgress,
  };
}

function pickMotivation(streak: number, goalMet: boolean, practicedToday: boolean, hasData: boolean): string {
  if (!hasData) return "Every clear speaker started with a first recording. Today's the day — I'm right here with you.";
  if (goalMet) return "You've hit your weekly practice goal. Your target for this week is complete.";
  if (practicedToday) return "Lovely work today. Even a few minutes keeps the momentum alive.";
  if (streak >= 3) return `A ${streak}-day streak! Keep it alive with a quick session — future you will thank you.`;
  return "Small and steady wins this. One short session today moves you forward.";
}

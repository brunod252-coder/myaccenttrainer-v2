import Link from "next/link";

import type { Recommendation } from "@/lib/recommendations/recommendation-service";

type Props = {
  recommendation: Recommendation;
};

export default function NinaRecommendationCard({ recommendation }: Props) {
  return (
    <section className="rounded border bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-[#20ad68]">
        Nina&apos;s Recommendation
      </p>

      <h2 className="mt-2 text-2xl font-bold text-[#52719f]">
        {recommendation.title}
      </h2>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
        {recommendation.reason}
      </p>

      <p className="mt-4 text-sm font-semibold text-gray-700">
        Estimated time: {recommendation.estimatedMinutes} minutes
      </p>

      <Link
        href={`/dashboard/lesson/${recommendation.lessonSlug}`}
        className="mt-6 inline-block rounded bg-[#20ad68] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#169357]"
      >
        Start Recommended Lesson
      </Link>
    </section>
  );
}

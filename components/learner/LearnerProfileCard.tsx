type LearnerProfile = {
  displayName: string;
  currentLevel: string;
  nativeLanguage: string;
  targetAccent: string;
  confidenceScore: number;
  lessonsCompleted: number;
  wordsPracticed: number;
  wordsPracticedToday?: number;
  confidenceGainedToday?: number;
  lastPracticedAt?: string;
  focusAreas: string[];
  strengths: string[];
};

type Props = {
  profile: LearnerProfile;
};

export default function LearnerProfileCard({ profile }: Props) {
  const lastPractice = profile.lastPracticedAt
    ? new Date(profile.lastPracticedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "Never";

  return (
    <section className="rounded border bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-[#20ad68]">
        Learner Profile
      </p>

      <h2 className="mt-2 text-2xl font-bold text-[#52719f]">
        {profile.displayName}
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-3">

        <Metric
          label="Current Level"
          value={profile.currentLevel}
        />

        <Metric
          label="Target Accent"
          value={profile.targetAccent}
        />

        <Metric
          label="Confidence"
          value={`${profile.confidenceScore}%`}
          change={
            profile.confidenceGainedToday
              ? `↑ +${profile.confidenceGainedToday}% today`
              : undefined
          }
        />

        <Metric
          label="Lessons Completed"
          value={profile.lessonsCompleted}
        />

        <Metric
          label="Words Practiced"
          value={profile.wordsPracticed}
          change={
            profile.wordsPracticedToday
              ? `+${profile.wordsPracticedToday} today`
              : undefined
          }
        />

        <Metric
          label="Last Practice"
          value={lastPractice}
        />

      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-gray-700">
          Focus Areas
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {profile.focusAreas.map((area) => (
            <span
              key={area}
              className="rounded-full bg-[#e9f8f3] px-3 py-1 text-xs font-semibold text-[#20ad68]"
            >
              {area}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  change,
}: {
  label: string;
  value: string | number;
  change?: string;
}) {
  return (
    <div className="rounded bg-[#f8fbfa] p-4">
      <p className="text-xs font-semibold uppercase text-gray-500">
        {label}
      </p>

      <p className="mt-2 font-bold text-[#52719f]">
        {value}
      </p>

      {change && (
        <p className="mt-2 text-xs font-semibold text-[#20ad68]">
          {change}
        </p>
      )}
    </div>
  );
}

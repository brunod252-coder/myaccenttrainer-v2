type Props = {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
};

export default function PronunciationEvaluationCard({
  score,
  summary,
  strengths,
  improvements,
}: Props) {
  return (
    <div className="mt-6 rounded border border-[#20ad68] bg-[#eef9f4] p-6">
      <p className="text-sm font-semibold uppercase text-[#20ad68]">
        Nina's First Impression
      </p>

      <h3 className="mt-2 text-3xl font-bold text-[#52719f]">
        {score}/100
      </h3>

      <p className="mt-4 text-sm leading-6 text-gray-700">
        {summary}
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="font-semibold text-[#20ad68]">
            Strengths
          </h4>

          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
            {strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-[#52719f]">
            Next Focus
          </h4>

          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
            {improvements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

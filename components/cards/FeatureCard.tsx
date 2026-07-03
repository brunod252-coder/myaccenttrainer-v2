type FeatureCardProps = {
  title: string;
};

export default function FeatureCard({ title }: FeatureCardProps) {
  return (
    <div className="rounded border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 text-3xl text-[#20ad68]">◎</div>
      <h3 className="font-bold">{title}</h3>
      <p className="mt-2 text-xs leading-5">
        My Accent Trainer unlocks the secrets of English pronunciation through
        easy-to-learn sounds and practical lessons.
      </p>
    </div>
  );
}
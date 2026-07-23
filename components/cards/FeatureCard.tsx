type FeatureCardProps = {
  title: string;
  description?: string;
  icon?: string;
};

export default function FeatureCard({
  title,
  description,
  icon = "◎",
}: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9f8f3] text-2xl">
        {icon}
      </div>
      <h3 className="mt-5 font-display text-lg text-[#17223b]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        {description ??
          "Unlock the secrets of English pronunciation through easy-to-learn sounds and practical lessons."}
      </p>
    </div>
  );
}

import ButtonLink from "@/components/ui/ButtonLink";

type PricingCardProps = {
  title: string;
  price: string;
  description: string;
  period?: string;
  features?: string[];
  buttonText?: string;
};

export default function PricingCard({
  title,
  price,
  description,
  period,
  features = [],
  buttonText = "Start free",
}: PricingCardProps) {
  return (
    <div className="relative mx-auto max-w-md rounded-3xl border-2 border-[#20ad68] bg-white p-10 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#20ad68] px-3 py-1 text-xs font-semibold text-white">
        Most popular
      </span>

      <h3 className="font-display text-xl text-[#168c56]">{title}</h3>

      <p className="mt-4">
        <span className="font-display text-4xl font-semibold text-[#17223b]">
          {price}
        </span>
        {period && <span className="text-sm text-gray-500">{period}</span>}
      </p>

      <p className="mt-3 text-sm text-gray-600">{description}</p>

      {features.length > 0 && (
        <ul className="mt-6 space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-gray-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#20ad68"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 h-4 w-4 shrink-0"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <ButtonLink href="/register">{buttonText}</ButtonLink>
      </div>
    </div>
  );
}

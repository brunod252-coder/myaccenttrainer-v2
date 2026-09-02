import ButtonLink from "@/components/ui/ButtonLink";

type PricingCardProps = {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText?: string;
  buttonHref?: string;
  badge?: string;
  emphasisText?: string;
};

export default function PricingCard({
  title,
  price,
  period,
  description,
  features,
  buttonText = "Start free",
  buttonHref = "/register",
  badge,
  emphasisText,
}: PricingCardProps) {
  return (
    <article className="relative flex h-full flex-col rounded-2xl border border-[#20ad68] bg-white p-7 shadow-sm">
      {badge ? (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#20ad68] px-3 py-1 text-xs font-semibold text-white">
          {badge}
        </div>
      ) : null}

      <div>
        <p className="text-sm font-semibold text-[#168c56]">
          {title}
        </p>

        <div className="mt-3 flex items-end gap-1">
          <span className="font-display text-4xl text-[#17223b]">
            {price}
          </span>
          <span className="pb-1 text-sm text-gray-500">
            {period}
          </span>
        </div>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          {description}
        </p>

        {emphasisText ? (
          <p className="mt-3 text-sm font-semibold text-[#168c56]">
            {emphasisText}
          </p>
        ) : null}
      </div>

      <ul className="mt-6 space-y-3 text-sm text-gray-700">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-3"
          >
            <span className="mt-0.5 text-[#20ad68]">
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        <ButtonLink href={buttonHref}>
          {buttonText}
        </ButtonLink>
      </div>
    </article>
  );
}

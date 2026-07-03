import ButtonLink from "@/components/ui/ButtonLink";

type PricingCardProps = {
  title: string;
  price: string;
  description: string;
  buttonText?: string;
};

export default function PricingCard({
  title,
  price,
  description,
  buttonText = "See Pricing",
}: PricingCardProps) {
  return (
    <div className="mx-auto max-w-sm border bg-white p-10 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
      <h3 className="text-xl font-bold text-[#20ad68]">
        {title}
      </h3>

      <p className="mt-4 text-2xl font-bold">
        {price}
      </p>

      <p className="mt-6 text-sm">
        {description}
      </p>

      <div className="my-10 border-t border-[#20ad68]" />

      <ButtonLink href="/prices">
        {buttonText}
      </ButtonLink>
    </div>
  );
}
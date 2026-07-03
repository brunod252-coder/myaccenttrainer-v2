type TestimonialCardProps = {
  name: string;
  country: string;
  quote: string;
};

export default function TestimonialCard({
  name,
  country,
  quote,
}: TestimonialCardProps) {
  return (
    <div className="rounded border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 text-4xl">💬</div>

      <p className="text-sm leading-6 italic text-gray-700">
        "{quote}"
      </p>

      <div className="mt-6">
        <p className="font-semibold text-[#20ad68]">{name}</p>
        <p className="text-xs text-gray-500">{country}</p>
      </div>
    </div>
  );
}
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
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="tracking-widest text-amber-400">★★★★★</div>

      <p className="mt-4 leading-7 text-gray-700">“{quote}”</p>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9f8f3] font-semibold text-[#20ad68]">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-[#17223b]">{name}</p>
          <p className="text-xs text-gray-500">{country}</p>
        </div>
      </div>
    </div>
  );
}

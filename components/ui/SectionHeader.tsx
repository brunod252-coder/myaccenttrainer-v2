type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
};

export default function SectionHeader({
  title,
  subtitle,
  eyebrow,
}: SectionHeaderProps) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-wider text-[#20ad68]">
          {eyebrow}
        </p>
      )}

      <h2 className="mt-2 font-display text-3xl text-[#17223b] md:text-4xl">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-4 leading-7 text-gray-600">{subtitle}</p>
      )}
    </div>
  );
}

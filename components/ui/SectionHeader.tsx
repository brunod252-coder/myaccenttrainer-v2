type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function SectionHeader({
  title,
  subtitle,
}: SectionHeaderProps) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <h2 className="text-2xl font-bold text-[#20ad68]">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-4 text-sm leading-6 text-gray-600">
          {subtitle}
        </p>
      )}
    </div>
  );
}
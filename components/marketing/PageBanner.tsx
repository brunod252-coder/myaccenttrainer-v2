import Container from "@/components/ui/Container";

type PageBannerProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
};

export default function PageBanner({ title, subtitle, eyebrow }: PageBannerProps) {
  return (
    <section className="border-b border-gray-100 bg-gradient-to-b from-[#f6faf8] to-white py-16">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-wider text-[#20ad68]">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-2 font-display text-4xl text-[#17223b] md:text-5xl">{title}</h1>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}

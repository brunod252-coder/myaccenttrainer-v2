import Container from "@/components/ui/Container";

type PageBannerProps = {
  title: string;
  subtitle?: string;
};

export default function PageBanner({
  title,
  subtitle,
}: PageBannerProps) {
  return (
    <section className="bg-[#eef6f3] py-16">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold text-[#52719f]">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-6 text-base leading-7 text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
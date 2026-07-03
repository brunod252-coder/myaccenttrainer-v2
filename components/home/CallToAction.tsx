import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export default function CallToAction() {
  return (
    <Section className="bg-[#e9f8f3]">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-[#52719f]">
            TRANSFORM YOUR ENGLISH{" "}
            <span className="text-[#20ad68]">
              PRONUNCIATION TODAY!
            </span>
          </h2>

          <p className="mt-6 text-sm leading-6">
            Join learners from around the world and begin building
            confidence in your English pronunciation today.
          </p>

          <div className="mt-10">
            <ButtonLink href="/courses">
              Go To Courses
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
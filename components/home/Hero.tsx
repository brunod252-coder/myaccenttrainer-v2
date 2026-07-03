import Container from "@/components/ui/Container";
import ButtonLink from "@/components/ui/ButtonLink";

export default function Hero() {
  return (
    <section className="bg-[#e9f8f3]">
      <Container>
        <div className="grid items-center gap-10 py-20 md:grid-cols-2">
          <div>
            <h1 className="max-w-xl text-4xl font-bold leading-tight text-[#52719f]">
              UNLOCK THE <span className="text-[#20ad68]">POWER OF CLEAR</span>{" "}
              ENGLISH PRONUNCIATION!
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-6 text-[#17223b]">
              Embark on your journey to mastering English with our Basic Lesson
              Course — Learn the sounds. Love the language!
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/courses">How does it work?</ButtonLink>
              <ButtonLink href="/about" variant="outline">
                Intro Video
              </ButtonLink>
            </div>
          </div>

          <div className="rounded-2xl bg-white/60 p-10 text-center text-[#52719f]">
            <div className="text-7xl">🎧</div>
            <p className="mt-4 font-semibold">Clear English starts here</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
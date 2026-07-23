export default function Footer() {
  return (
    <footer className="mt-auto bg-[#142b4c] px-6 py-16 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="text-lg font-bold">
            <span className="text-[#3ecb8a]">my</span>
            <span className="mx-1 rounded-md bg-[#20ad68] px-1.5 text-white">
              ACCENT
            </span>
            <span className="text-white/80">trainer</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
            Your bridge to clear, confident English. Empowering learners
            worldwide with the tools to master the English accent and
            communicate effectively.
          </p>
        </div>

        <FooterColumn title="Affiliates" items={["Affiliate Login", "Register Now"]} />
        <FooterColumn title="Help" items={["Privacy Policy", "Terms & Conditions"]} />
        <FooterColumn title="Contact" items={["Email", "Minneapolis, MN"]} />
      </div>

      <div className="mx-auto mt-12 max-w-6xl border-t border-white/10 pt-8 text-center text-xs text-white/60">
        Copyright © 2026 myACCENTtrainer
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-bold">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm text-white/70">
        {items.map((item) => (
          <li key={item} className="transition hover:text-white">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

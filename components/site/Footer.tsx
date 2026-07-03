export default function Footer() {
  return (
    <footer className="bg-[#142b4c] px-6 py-14 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-5">
        <div className="md:col-span-2">
          <h3 className="font-bold text-[#20ad68]">My Accent Trainer</h3>
          <p className="mt-4 max-w-sm text-sm leading-6">
            Your bridge to clear, confident English. Empowering learners
            worldwide with the tools to master the English accent and
            communicate effectively.
          </p>
        </div>

        <FooterColumn title="Affiliates" items={["Affiliate Login", "Register Now"]} />
        <FooterColumn title="Help" items={["Privacy Policy", "Terms & Conditions"]} />
        <FooterColumn title="Contact" items={["Email", "Minneapolis, MN"]} />
      </div>

      <p className="mt-12 text-center text-xs">
        Copyright © 2026 myACCENTtrainer
      </p>
    </footer>
  );
}

function FooterColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-bold">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
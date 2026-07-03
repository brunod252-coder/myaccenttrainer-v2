import { ReactNode } from "react";

import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";

type MarketingLayoutProps = {
  children: ReactNode;
};

export default function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  return (
    <main className="min-h-screen bg-white text-[#17223b]">
      <Header />

      {children}

      <Footer />
    </main>
  );
}
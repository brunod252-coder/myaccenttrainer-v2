import type { ReactNode } from "react";

type SectionProps = {
  children: ReactNode;
  className?: string;
};

export default function Section({ children, className = "" }: SectionProps) {
  return <section className={`py-20 ${className}`}>{children}</section>;
}
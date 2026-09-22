import type { ReactNode } from "react";

import AppSidebar from "@/components/app/AppSidebar";
import AppTopbar from "@/components/app/AppTopbar";

type AppLayoutProps = {
  children: ReactNode;
  userName?: string | null;
  role?: string | null;
};

export default function AppLayout({
  children,
  userName,
  role,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--mat-canvas)] text-[var(--mat-ink)]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[252px_minmax(0,1fr)]">
        <AppSidebar userName={userName} role={role} />

        <div className="flex min-h-screen min-w-0 flex-col">
          <AppTopbar userName={userName} />

          <main className="w-full flex-1">
            <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9 xl:px-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

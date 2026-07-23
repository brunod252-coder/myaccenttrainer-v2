import type { ReactNode } from "react";

import AppSidebar from "@/components/app/AppSidebar";
import AppTopbar from "@/components/app/AppTopbar";

type AppLayoutProps = {
  children: ReactNode;
  userName?: string | null;
  role?: string | null;
};

export default function AppLayout({ children, userName, role }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f6faf8] text-[#17223b]">
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
        <AppSidebar userName={userName} role={role} />
        <div className="flex min-h-screen flex-col">
          <AppTopbar userName={userName} />
          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 md:px-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

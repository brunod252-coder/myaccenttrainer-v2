import DashboardPlaceholderPage from "@/components/dashboard/DashboardPlaceholderPage";
import { getDashboardUser } from "@/lib/dashboard/getDashboardUser";

export default async function WalletPage() {
  const { user, userName } = await getDashboardUser();

  return (
    <DashboardPlaceholderPage
      title="Wallet"
      subtitle="Your lesson credits, subscriptions, and payment history will appear here."
      userName={userName}
      role={user.role}
    />
  );
}

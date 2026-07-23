import DashboardPlaceholderPage from "@/components/dashboard/DashboardPlaceholderPage";
import { getDashboardUser } from "@/lib/dashboard/getDashboardUser";

export default async function ReferralsPage() {
  const { user, userName } = await getDashboardUser();

  return (
    <DashboardPlaceholderPage
      title="Referrals"
      subtitle="Invite friends and track your referral rewards here."
      userName={userName}
      role={user.role}
    />
  );
}


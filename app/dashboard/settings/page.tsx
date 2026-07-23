import DashboardPlaceholderPage from "@/components/dashboard/DashboardPlaceholderPage";
import { getDashboardUser } from "@/lib/dashboard/getDashboardUser";

export default async function SettingsPage() {
  const { user, userName } = await getDashboardUser();

  return (
    <DashboardPlaceholderPage
      title="Settings"
      subtitle="Manage your profile, preferences, and account settings."
      userName={userName}
      role={user.role}
    />
  );
}

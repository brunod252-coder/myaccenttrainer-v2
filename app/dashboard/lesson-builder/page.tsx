import AppLayout from "@/components/layouts/AppLayout";
import { getDashboardUser } from "@/lib/dashboard/getDashboardUser";
import LessonBuilderForm from "@/components/lesson-builder/LessonBuilderForm";

export default async function LessonBuilderPage() {
  const { user, userName } = await getDashboardUser();

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="space-y-8">
          <LessonBuilderForm />
      </div>
    </AppLayout>
  );
}

import AppLayout from "@/components/layouts/AppLayout";
import VoiceGeneratorForm from "@/components/voice/VoiceGeneratorForm";
import { getDashboardUser } from "@/lib/dashboard/getDashboardUser";

export default async function VoicePage() {
  const { user, userName } = await getDashboardUser();

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="space-y-8">
        <div className="rounded border bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-[#20ad68]">
            Nina Voice Engine
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#52719f]">
            Generate lesson audio
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
            Enter a word or phrase, then generate normal, slow, and slower
            pronunciation audio for future lessons.
          </p>
        </div>

        <VoiceGeneratorForm />
      </div>
    </AppLayout>
  );
}

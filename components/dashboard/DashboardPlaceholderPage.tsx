import AppLayout from "@/components/layouts/AppLayout";

type Props = {
  title: string;
  subtitle: string;
  userName: string;
  role: string;
};

export default function DashboardPlaceholderPage({
  title,
  subtitle,
  userName,
  role,
}: Props) {
  return (
    <AppLayout userName={userName} role={role}>
      <div className="rounded border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-[#20ad68]">Coming Soon</p>
        <h1 className="mt-2 text-3xl font-bold text-[#52719f]">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
          {subtitle}
        </p>
      </div>
    </AppLayout>
  );
}

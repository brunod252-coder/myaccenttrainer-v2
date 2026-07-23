import type { ReactNode } from "react";

type StatTileProps = {
  label: string;
  value: string;
  hint?: string;
  icon: ReactNode;
  iconBg?: string;
  iconColor?: string;
};

export default function StatTile({
  label,
  value,
  hint,
  icon,
  iconBg = "#e9f8f3",
  iconColor = "#20ad68",
}: StatTileProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        {hint && (
          <span className="rounded-full bg-[#e9f8f3] px-2.5 py-1 text-xs font-semibold text-[#168c56]">
            {hint}
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-[#17223b]">{value}</p>
      <p className="mt-0.5 text-sm text-gray-500">{label}</p>
    </div>
  );
}

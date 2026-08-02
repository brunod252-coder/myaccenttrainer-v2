import type { ReactNode } from "react";

export default function AdminWorkspace({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#20ad68]">
          {eyebrow}
        </p>

        <h1 className="mt-3 font-display text-3xl text-[#17223b] sm:text-4xl">
          {title}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500 sm:text-base">
          {description}
        </p>
      </div>

      {children ? (
        <div className="mt-6">{children}</div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <p className="font-semibold text-[#17223b]">
            Workspace foundation created
          </p>
          <p className="mt-2 text-sm text-gray-500">
            The management tools for this section will be added during Phase 2.
          </p>
        </div>
      )}
    </div>
  );
}

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
    <div className="space-y-6">
      <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-8">
        <p className="mat-eyebrow">{eyebrow}</p>

        <h1 className="mt-2 max-w-4xl font-display text-3xl text-[var(--mat-ink)] sm:text-4xl">
          {title}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--mat-muted)] sm:text-base">
          {description}
        </p>
      </section>

      {children ? (
        <div>{children}</div>
      ) : (
        <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-8">
          <div className="max-w-2xl">
            <p className="mat-eyebrow">Workspace status</p>

            <h2 className="mt-2 font-display text-2xl text-[var(--mat-ink)]">
              Management tools are not connected here yet
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--mat-muted)]">
              This route currently provides the administrative workspace for
              this area, but no route-specific management controls are exposed
              on this page yet.
            </p>

            <div className="mt-5 rounded-[var(--mat-radius-lg)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-4">
              <p className="text-sm font-semibold text-[var(--mat-ink)]">
                Capability boundary
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--mat-muted)]">
                No create, edit, publish, delete, financial, or learner-data
                action is performed by this workspace unless explicit controls
                are rendered here.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

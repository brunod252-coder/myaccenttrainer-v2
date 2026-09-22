import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import ProfileForm from "@/components/app/ProfileForm";
import AppLayout from "@/components/layouts/AppLayout";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mat_session")?.value;

  if (!token) redirect("/login");

  const payload = verifyAuthToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { profile: true },
  });

  if (!user) redirect("/login");

  const userName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  const initial = {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    countryOfResidence: user.profile?.countryOfResidence ?? "",
    nativeLanguage: user.profile?.nativeLanguage ?? "",
    englishGoal: user.profile?.englishGoal ?? "",
    proficiencyLevel: user.profile?.proficiencyLevel ?? "",
  };

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="space-y-6">
        <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-8">
          <p className="mat-eyebrow">Settings</p>

          <h1 className="mt-2 font-display text-3xl text-[var(--mat-ink)] sm:text-4xl">
            Your account
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--mat-muted)] sm:text-base">
            Keep your personal details and learning profile current, and review
            the account information associated with your sign-in.
          </p>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
            <p className="mat-eyebrow">Learning profile</p>

            <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
              Personalize your learning
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
              Update the profile information used by My Accent Trainer when
              personalizing your learning experience.
            </p>

            <div className="mt-6">
              <ProfileForm initial={initial} />
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
              <p className="mat-eyebrow">Account</p>

              <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                Account details
              </h2>

              <dl className="mt-5 divide-y divide-[var(--mat-border)]">
                <div className="flex flex-col gap-1 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <dt className="text-sm text-[var(--mat-muted)]">Email</dt>
                  <dd className="break-all text-sm font-semibold text-[var(--mat-ink)]">
                    {user.email}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-[var(--mat-muted)]">Role</dt>
                  <dd className="text-sm font-semibold text-[var(--mat-ink)]">
                    {user.role}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 py-3 last:pb-0">
                  <dt className="text-sm text-[var(--mat-muted)]">
                    Member since
                  </dt>
                  <dd className="text-sm font-semibold text-[var(--mat-ink)]">
                    {memberSince}
                  </dd>
                </div>
              </dl>

              <p className="mt-5 text-xs leading-5 text-[var(--mat-muted-light)]">
                Your sign-in email is shown here as account information and is
                not editable from this profile form.
              </p>
            </section>

            <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-6 sm:p-7">
              <p className="mat-eyebrow">Session</p>

              <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                Sign out
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
                End your My Accent Trainer session on this device.
              </p>

              <form action="/api/auth/logout" method="post" className="mt-5">
                <button
                  type="submit"
                  className="mat-button mat-button-secondary w-full justify-center"
                >
                  Log out
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

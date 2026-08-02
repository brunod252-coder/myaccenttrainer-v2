export type EnrollmentState =
  | "EMAIL_VERIFICATION_REQUIRED"
  | "PLAN_SELECTION_REQUIRED"
  | "PAYMENT_METHOD_REQUIRED"
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCEL_SCHEDULED"
  | "CANCELED"
  | "EXPIRED";

export type EnrollmentUser = {
  emailVerified: boolean;
  subscriptionStatus?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
};

const DASHBOARD_ACCESS_STATES = new Set<EnrollmentState>([
  "TRIALING",
  "ACTIVE",
  "CANCEL_SCHEDULED",
]);

/**
 * Determines the learner's current enrollment stage.
 *
 * This function is intentionally independent of Next.js, Prisma, and Stripe.
 * It receives only the user fields needed to make an enrollment decision.
 */
export function getEnrollmentState(
  user: EnrollmentUser,
): EnrollmentState {
  if (!user.emailVerified) {
    return "EMAIL_VERIFICATION_REQUIRED";
  }

  const status = normalizeSubscriptionStatus(user.subscriptionStatus);

  switch (status) {
    case "trialing":
      return "TRIALING";

    case "active":
      return "ACTIVE";

    case "past_due":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
      return "PAST_DUE";

    case "cancel_scheduled":
      return "CANCEL_SCHEDULED";

    case "canceled":
    case "cancelled":
      return "CANCELED";

    case "expired":
      return "EXPIRED";

    case "payment_method_required":
      return "PAYMENT_METHOD_REQUIRED";

    default:
      /*
       * A verified learner with no Stripe subscription has not yet
       * selected and completed a membership enrollment.
       */
      return "PLAN_SELECTION_REQUIRED";
  }
}

/**
 * Returns the route where the learner should be sent next.
 *
 * A null result means the learner may enter the dashboard.
 */
export function getEnrollmentRedirect(
  state: EnrollmentState,
): string | null {
  switch (state) {
    case "EMAIL_VERIFICATION_REQUIRED":
      return "/verify-email";

    case "PLAN_SELECTION_REQUIRED":
      return "/onboarding/plan";

    case "PAYMENT_METHOD_REQUIRED":
      return "/onboarding/payment";

    case "PAST_DUE":
    case "CANCELED":
    case "EXPIRED":
      return "/dashboard/billing";

    case "TRIALING":
    case "ACTIVE":
    case "CANCEL_SCHEDULED":
      return null;
  }
}

/**
 * Convenience helper for guards and API authorization.
 */
export function canAccessDashboard(
  state: EnrollmentState,
): boolean {
  return DASHBOARD_ACCESS_STATES.has(state);
}

function normalizeSubscriptionStatus(
  status?: string | null,
): string {
  return status?.trim().toLowerCase() ?? "";
}

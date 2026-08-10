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

/**
 * Central enrollment semantics.
 *
 * These helpers intentionally operate on EnrollmentState rather
 * than raw Stripe/local subscription status strings.
 *
 * UI pages, route guards, and application authorization should
 * consume these meanings instead of maintaining independent
 * status arrays.
 */

const PAYMENT_RECOVERY_STATES =
  new Set<EnrollmentState>([
    "PAYMENT_METHOD_REQUIRED",
    "PAST_DUE",
  ]);

const ENDED_MEMBERSHIP_STATES =
  new Set<EnrollmentState>([
    "CANCELED",
    "EXPIRED",
  ]);

const PLAN_SELECTION_STATES =
  new Set<EnrollmentState>([
    "PLAN_SELECTION_REQUIRED",
    "CANCELED",
    "EXPIRED",
  ]);

export function hasPremiumAccess(
  state: EnrollmentState,
): boolean {
  return canAccessDashboard(state);
}

export function needsPaymentRecovery(
  state: EnrollmentState,
): boolean {
  return PAYMENT_RECOVERY_STATES.has(state);
}

export function hasEndedMembership(
  state: EnrollmentState,
): boolean {
  return ENDED_MEMBERSHIP_STATES.has(state);
}

export function canChoosePlan(
  state: EnrollmentState,
): boolean {
  return PLAN_SELECTION_STATES.has(state);
}

/**
 * This is an application-level checkout eligibility decision.
 *
 * It does NOT replace Stripe's authoritative duplicate-
 * subscription/reconciliation checks in /api/checkout.
 */
export function canStartCheckout(
  state: EnrollmentState,
): boolean {
  return (
    state === "PLAN_SELECTION_REQUIRED" ||
    state === "CANCELED" ||
    state === "EXPIRED"
  );
}


/**
 * Subscription-management semantics.
 *
 * These helpers describe actions available to the learner.
 * Stripe remains authoritative when the corresponding API
 * endpoint actually performs the subscription mutation.
 */
export function canCancelSubscription(
  state: EnrollmentState,
): boolean {
  return (
    state === "TRIALING" ||
    state === "ACTIVE"
  );
}

export function canResumeSubscription(
  state: EnrollmentState,
): boolean {
  return state === "CANCEL_SCHEDULED";
}

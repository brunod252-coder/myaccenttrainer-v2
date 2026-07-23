// ── Promotional credit codes ─────────────────────────────────────────
// Codes are defined in code (no database table needed). Redeeming a code
// records a normal wallet transaction, and a learner can redeem each code
// only once (enforced by checking existing transactions in wallet.ts).

export type Promo = {
  code: string;
  creditMinor: number;   // credit granted, in cents
  label: string;         // shown in the wallet ledger
  note: string;          // shown to the learner on success
};

const PROMOS: Promo[] = [
  { code: "WELCOME10", creditMinor: 1000, label: "Welcome promo — WELCOME10", note: "$10.00 welcome credit added to your wallet." },
  { code: "STUDENT25", creditMinor: 2500, label: "Student promo — STUDENT25", note: "$25.00 student credit added to your wallet." },
  { code: "NINA5",     creditMinor: 500,  label: "Nina promo — NINA5",       note: "$5.00 credit added — enjoy your practice!" },
];

export function findPromo(code: string): Promo | undefined {
  const normalized = code.trim().toUpperCase();
  return PROMOS.find((p) => p.code === normalized);
}

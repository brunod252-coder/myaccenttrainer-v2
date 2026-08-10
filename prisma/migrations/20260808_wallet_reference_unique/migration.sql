CREATE UNIQUE INDEX IF NOT EXISTS
"WalletTransaction_walletAccountId_referenceType_referenceId_key"
ON "WalletTransaction"(
  "walletAccountId",
  "referenceType",
  "referenceId"
);

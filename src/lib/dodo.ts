import DodoPayments from "dodopayments";

// Singleton pattern — same approach as lib/prisma.ts
const globalForDodo = globalThis as unknown as { dodo: DodoPayments | undefined };

export const dodo =
  globalForDodo.dodo ??
  new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY ?? "",
    environment: process.env.NODE_ENV === "production" ? "live_mode" : "test_mode",
  });

if (process.env.NODE_ENV !== "production") globalForDodo.dodo = dodo;

export default dodo;

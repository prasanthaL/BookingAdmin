import DodoPayments from "dodopayments";

// Singleton pattern — same approach as lib/prisma.ts
const globalForDodo = global as unknown as { dodo: DodoPayments };

export const dodo =
  globalForDodo.dodo ??
  new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY ?? "",
    environment: "test_mode",
  });

if (process.env.NODE_ENV !== "production") globalForDodo.dodo = dodo;

export default dodo;

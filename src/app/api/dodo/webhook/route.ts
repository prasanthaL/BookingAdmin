import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BillingProvider } from "@prisma/client";

// Dodo sends a signature header — verify it to prevent forged webhooks
async function verifyDodoSignature(req: NextRequest, body: string): Promise<boolean> {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
  if (!secret) return false;

  const signature = req.headers.get("webhook-signature") ?? "";
  if (!signature) return false;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(body);

  const key = await crypto.subtle.importKey(
    "raw", keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, msgData);
  const computedHex = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedHex === signature;
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  const valid = await verifyDodoSignature(req, body);
  if (!valid) {
    console.warn("[dodo/webhook] Invalid signature — rejected");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type: string = event?.type ?? "";
  const data = event?.data ?? {};

  console.log("[dodo/webhook] Received event:", type);

  try {
    switch (type) {
      // ── Subscription created / activated ──────────────────────────────────
      case "subscription.active": {
        const businessId      = data.metadata?.businessId as string | undefined;
        const plan            = (data.metadata?.plan as string | undefined)?.toUpperCase();
        const dodoCustomerId  = data.customer?.customer_id as string | undefined;
        const dodoSubId       = data.subscription_id as string | undefined;
        const periodStart     = data.current_period_start ? new Date(data.current_period_start) : undefined;
        const periodEnd       = data.current_period_end   ? new Date(data.current_period_end)   : undefined;

        if (!businessId) break;

        // Upsert by finding the existing subscription first
        const existingSub = await prisma.subscription.findFirst({ where: { businessId } });
        await prisma.$transaction([
          existingSub
            ? prisma.subscription.update({
                where:  { id: existingSub.id },
                data: {
                  status:             "ACTIVE",
                  plan:               (plan as any) ?? "STARTER",
                  provider:           BillingProvider.DODO_PAYMENTS,
                  dodoCustomerId,
                  dodoSubscriptionId: dodoSubId,
                  currentPeriodStart: periodStart,
                  currentPeriodEnd:   periodEnd,
                  amount:             data.amount ? data.amount / 100 : undefined,
                  currency:           data.currency?.toUpperCase() ?? "USD",
                },
              })
            : prisma.subscription.create({
                data: {
                  businessId,
                  plan:                (plan as any) ?? "STARTER",
                  provider:            BillingProvider.DODO_PAYMENTS,
                  status:              "ACTIVE",
                  dodoCustomerId,
                  dodoSubscriptionId:  dodoSubId,
                  currentPeriodStart:  periodStart,
                  currentPeriodEnd:    periodEnd,
                  amount:              data.amount ? data.amount / 100 : undefined,
                  currency:           data.currency?.toUpperCase() ?? "USD",
                },
              }),
          prisma.business.update({
            where: { id: businessId },
            data: {
              accessStatus:       "ACTIVE",
              plan:               (plan as any) ?? "STARTER",
              subscriptionEndsAt: periodEnd,
            },
          }),
        ]);
        break;
      }

      // ── Subscription renewed ───────────────────────────────────────────────
      case "subscription.renewed": {
        const dodoSubId  = data.subscription_id as string | undefined;
        const periodEnd  = data.current_period_end ? new Date(data.current_period_end) : undefined;
        if (!dodoSubId) break;

        const sub = await prisma.subscription.findFirst({ where: { dodoSubscriptionId: dodoSubId } });
        if (!sub) break;

        await prisma.$transaction([
          prisma.subscription.update({
            where: { id: sub.id },
            data:  { status: "ACTIVE", currentPeriodEnd: periodEnd },
          }),
          prisma.business.update({
            where: { id: sub.businessId },
            data:  { accessStatus: "ACTIVE", subscriptionEndsAt: periodEnd },
          }),
        ]);
        break;
      }

      // ── Subscription cancelled ─────────────────────────────────────────────
      case "subscription.cancelled": {
        const dodoSubId = data.subscription_id as string | undefined;
        if (!dodoSubId) break;

        const sub = await prisma.subscription.findFirst({ where: { dodoSubscriptionId: dodoSubId } });
        if (!sub) break;

        await prisma.$transaction([
          prisma.subscription.update({
            where: { id: sub.id },
            data:  { status: "CANCELED" },
          }),
          prisma.business.update({
            where: { id: sub.businessId },
            data:  { accessStatus: "EXPIRED" },
          }),
        ]);
        break;
      }

      // ── Payment failed ─────────────────────────────────────────────────────
      case "subscription.past_due": {
        const dodoSubId = data.subscription_id as string | undefined;
        if (!dodoSubId) break;

        const sub = await prisma.subscription.findFirst({ where: { dodoSubscriptionId: dodoSubId } });
        if (!sub) break;

        await prisma.$transaction([
          prisma.subscription.update({
            where: { id: sub.id },
            data:  { status: "PAST_DUE" },
          }),
          prisma.business.update({
            where: { id: sub.businessId },
            data:  { accessStatus: "PAST_DUE" },
          }),
        ]);
        break;
      }

      default:
        // Unknown event — log and return 200 so Dodo doesn't retry
        console.log("[dodo/webhook] Unhandled event type:", type);
    }
  } catch (err) {
    console.error("[dodo/webhook] DB error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

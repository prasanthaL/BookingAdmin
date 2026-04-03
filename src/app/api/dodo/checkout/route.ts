import { NextRequest, NextResponse } from "next/server";
import { dodo } from "@/lib/dodo";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Map our plan names to Dodo product/price IDs
// You must create these products in your Dodo dashboard and paste the IDs here
const PLAN_PRICE_MAP: Record<string, string> = {
  STARTER:      process.env.DODO_PRICE_STARTER       ?? "",
  PROFESSIONAL: process.env.DODO_PRICE_PROFESSIONAL  ?? "",
  ENTERPRISE:   process.env.DODO_PRICE_ENTERPRISE     ?? "",
};

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await req.json() as { plan: string };
    const priceId = PLAN_PRICE_MAP[plan?.toUpperCase()];

    if (!priceId) {
      return NextResponse.json(
        { error: `No price configured for plan "${plan}". Add DODO_PRICE_${plan?.toUpperCase()} to your .env file.` },
        { status: 400 }
      );
    }

    // Fetch the business linked to this user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { business: true },
    });

    if (!user?.business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Build the checkout payload using checkoutSessions.create (non-deprecated)
    const checkoutSession = await dodo.checkoutSessions.create({
      product_cart: [{
        product_id: priceId,
        quantity: 1,
      }],
      customer: {
        email: user.business.contactEmail,
        name: user.business.name,
      },
      billing_address: {
        country: "LK",
      },
      return_url: `${process.env.NEXTAUTH_URL}/billing/upgrade?success=true`,
      metadata: {
        businessId: user.business.id,
        plan,
      },
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.checkout_url,
    });
  } catch (err: any) {
    console.error("[dodo/checkout]", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getStripe } from "../../../drum/_lib/stripeServer";

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.priceId) {
    return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
  }

  const origin = req.headers.get("origin") || "";
  const successUrl = body.successUrl || `${origin}/drum/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = body.cancelUrl || `${origin}/drum/checkout/cancel`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: body.priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: body.email || undefined,
    metadata: {
      user_id: body.userId || "",
      lessons: String(body.lessons || ""),
      pack: String(body.pack || ""),
    },
  });

  return NextResponse.json({ url: session.url });
}

import { NextResponse } from "next/server";
import { getStripe } from "../../../drum/_lib/stripeServer";
import { getSupabaseAdmin } from "../../../drum/_lib/supabaseAdmin";

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      id: string;
      payment_intent?: string | null;
      amount_total?: number | null;
      currency?: string | null;
      metadata?: Record<string, string> | null;
    };

    const userId = session.metadata?.user_id;
    const lessons = Number(session.metadata?.lessons || 0);
    const pack = session.metadata?.pack || "";

    if (!userId || !lessons) {
      return NextResponse.json({ received: true });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 });
    }

    const { data: existingPurchase } = await admin
      .from("drum_purchases")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();
    if (existingPurchase) {
      return NextResponse.json({ received: true });
    }

    await admin.from("drum_purchases").insert({
      user_id: userId,
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent,
      product: pack,
      lessons,
      amount: session.amount_total,
      currency: session.currency,
    });

    const { data: existing } = await admin
      .from("drum_entitlements")
      .select("lesson_credits")
      .eq("user_id", userId)
      .maybeSingle();

    const current = existing?.lesson_credits ?? 0;
    await admin
      .from("drum_entitlements")
      .upsert({ user_id: userId, lesson_credits: current + lessons, updated_at: new Date().toISOString() });
  }

  return NextResponse.json({ received: true });
}

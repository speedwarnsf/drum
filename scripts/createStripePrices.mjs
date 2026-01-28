import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Missing STRIPE_SECRET_KEY");
  process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: "2024-06-20" });

const product = await stripe.products.create({
  name: "Adaptive Drum Instructor Lesson Pack",
});

async function createPrice(label, amount) {
  return stripe.prices.create({
    product: product.id,
    unit_amount: amount,
    currency: "usd",
    metadata: { pack: label },
  });
}

const tester = await createPrice("TESTER_10", 200);
const pack50 = await createPrice("PACK_50", 1000);
const pack100 = await createPrice("PACK_100", 1500);
const pack100Repeat = await createPrice("PACK_100_REPEAT", 1200);

console.log("Product:", product.id);
console.log("NEXT_PUBLIC_STRIPE_PRICE_TESTER_10=", tester.id);
console.log("NEXT_PUBLIC_STRIPE_PRICE_50=", pack50.id);
console.log("NEXT_PUBLIC_STRIPE_PRICE_100=", pack100.id);
console.log("NEXT_PUBLIC_STRIPE_PRICE_100_REPEAT=", pack100Repeat.id);

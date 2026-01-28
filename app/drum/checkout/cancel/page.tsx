import Shell from "../../_ui/Shell";

export default function CheckoutCancelPage() {
  return (
    <Shell title="Checkout canceled" subtitle="No charge was made.">
      <section className="card">
        <p>If you want to try again, pick a pack below.</p>
        <div className="row">
          <a className="btn" href="/drum/signup">Back to packs</a>
        </div>
      </section>
    </Shell>
  );
}

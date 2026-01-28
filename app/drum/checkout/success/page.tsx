import Shell from "../../_ui/Shell";

export default function CheckoutSuccessPage() {
  return (
    <Shell title="Payment complete" subtitle="Your lessons are ready.">
      <section className="card">
        <p>Thanks! Your lesson credits will appear shortly.</p>
        <div className="row">
          <a className="btn" href="/drum/today">Go to today</a>
          <a className="btn btn-ghost" href="/drum/journal">Log</a>
        </div>
      </section>
    </Shell>
  );
}

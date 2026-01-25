import LoginForm from "./ui";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  return (
    <main className="shell shell-tight">
      <header className="shell-header">
        <div className="shell-head">
          <div>
            <div className="kicker">Private Access</div>
            <h1 className="title">Log in</h1>
            <p className="sub">
        This area is private (for now). Use the credentials you set in Vercel.
            </p>
          </div>
        </div>
      </header>
      <LoginForm nextPath={searchParams?.next ?? "/drum"} />
    </main>
  );
}

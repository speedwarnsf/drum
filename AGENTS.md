# Working Agreement (Codex)

## Defaults
- Always work on a new branch (never commit on main).
- After each logical step: run tests/lint, then show /diff summary.
- Prefer `gh` for PRs (create PR with a clear title/body and checklist).
- Prefer Vercel preview deploys (avoid production unless explicitly requested).

## Shipping flow
1) Create branch.
2) Implement with smallest viable diff.
3) Run tests.
4) Summarize changes + risks.
5) Commit with a meaningful message.
6) Push branch.
7) Open PR via `gh pr create`.

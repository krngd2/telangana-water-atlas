# Security policy

Security fixes target the latest code on `main`. Older snapshots and forks do
not receive a separate maintenance commitment.

## Report a vulnerability

Use the repository's **Security → Report a vulnerability** feature for a private
report: https://github.com/krngd2/telangana-water-atlas/security/advisories/new

Include the affected commit, reproduction steps, impact and a proposed fix if
available. Do not include real credentials or other people's personal data.
Please avoid publishing exploit details before maintainers have reviewed them.
If private reporting is unavailable, open a public issue requesting a private
contact method without disclosing the vulnerability. No response SLA is promised.

Factual disputes and stale water readings belong in a **data correction**, not a
security report. This atlas is not an emergency warning or operational system.

## Deployment

Deploy only the built `dist/` folder. Keep source download caches, local files and
credentials off the web host. The app has no backend, login or required API key.
CI tests run with read-only repository permissions and do not need secrets.
Data preparation scripts contact upstream providers only when explicitly run.

Dependency alerts and CI help identify problems; they do not guarantee security.

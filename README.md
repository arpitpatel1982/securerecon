# SecureRecon

A React and Express web reconnaissance dashboard with SSL/TLS, security
headers, technology detection, DNS, WHOIS, email security, IP information,
port scanning, subdomain discovery, and exposure checks.

Only scan systems you own or have explicit permission to assess.

## Run locally

Requires Node.js, npm, and a PostgreSQL database.

1. Run `npm ci`.
2. Set `DATABASE_URL` privately in your shell or hosting environment.
   `.env.example` lists the variable name only; the app does not automatically
   load `.env` files.
3. Run `npm run db:push` against your development database.
4. Run `npm run dev`. The application serves on port 5000.

For a production build, run `npm run build`, then `npm start`.
Run `npm run check` for TypeScript checks.

## Important limitations

- Dark-web exposure results are **simulated demo data**, not verified breaches
  or live dark-web monitoring. Do not treat them as evidence of an incident.
- External lookups can fail, be rate-limited, or return incomplete data.
- Findings are reconnaissance signals, not a guarantee of security or a
  substitute for a professional assessment.
- Dependency security findings remain unresolved. Review and update
  dependencies before deploying this application in an untrusted environment.

## Secrets and private data

Keep database URLs, passwords, API keys, tokens, and session secrets in your
private environment, never in source code. Do not expose secrets through
client-side environment variables.

The public source export excludes private workspace state, database contents,
scan history, logs, dependencies, and build output. Its initial commit is a
source snapshot rather than the workspace's checkpoint history.

If a credential is ever committed, revoke or rotate it immediately; deleting
the file alone does not remove it from Git history.

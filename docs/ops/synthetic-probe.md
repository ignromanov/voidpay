# Synthetic probe

`.github/workflows/synthetic-probe.yml` runs every 3 hours (at :17 past 00, 03, …, 21 UTC) and on `workflow_dispatch`, against https://voidpay.xyz (#363).

## Checks
- `/api/rpc`: `eth_blockNumber` on chains 1, 8453, 42161, 10, 137. Expects 200 and a hex `result`.
- `/api/transfers`: Base, fixed public address, `fromBlock` = Base head - 100. Expects 200.
- `/api/health`: GET. Expects 200 and `checks.rateLimiter.reachable == true`.

## Alert classes
- `limiter_unavailable`: 503, or health reports the limiter unreachable (Upstash down/archived).
- `provider_error`: 502 or other 5xx, or a missing `result`.
- `rate_limited`: 429 on the probe (bucket exhaustion or broken limiter config).
- `blocked`: 403/415 (probe misconfiguration: Origin or Content-Type).
- `unreachable` / `unexpected`: no response / any other status.

Any non-ok result fails the job (GitHub failure notification) and opens or comments on the issue
`[probe] Payment path unhealthy` (`bug`, `area:rpc`, `p0`). A fully ok run comments "recovered" and closes it.
Response bodies are never logged (public repo).

## Dead-man's switch
GitHub disables scheduled workflows in public repos after 60 days of inactivity, so the probe can die silently.
Create a healthchecks.io check (period 3 h, grace 3 h; GitHub cron runs are sometimes delayed or dropped, so this grace tolerates one missed run and alerts after two consecutive misses), then set the repo secret
`PROBE_HEARTBEAT_URL` to its ping URL. The step is a no-op until the secret exists and only pings after a fully healthy run.

## Privileges
None by design (Shade constraints): anonymous client, no secrets, no bypass headers, no IP allowlist,
no `?mock=`. `Origin` is an anti-browser control, not authentication, so sending it is not a bypass.

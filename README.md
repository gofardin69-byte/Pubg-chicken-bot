# Chicken Bot — Demo Dashboard

A Node.js/Express dashboard with a five-hour server-side timer, manual demo score tracking, and an activity log.

## Important limitations

This is a demo timer/dashboard only. It does **not** log in to PUBG, connect to PUBG game servers, access player accounts, automate gameplay, or send real Chicken gifts. Only add a real integration if PUBG provides an official, documented and permitted API for that exact action.

The timer runs on the host server, not on the phone. If the hosting provider stops/restarts/suspends the service, execution cannot be guaranteed. The timer checks its end timestamp after a restart, but no cloud host can guarantee uninterrupted execution on a free tier unless its plan explicitly guarantees it.

## Run locally

1. Install Node.js 18 or newer.
2. Run `npm install`.
3. Set `DASHBOARD_PASSWORD` to a private password in your environment.
4. Run `npm start`.
5. Open `http://localhost:3000`.

## Deploy

Use a Node.js web service with start command `npm start` and HTTP port `3000` (or the host-provided `PORT`). Set the environment variable `DASHBOARD_PASSWORD` in the hosting dashboard. Never put the password in GitHub source code.

The `data/` directory is used to save timer state and demo scores when the host filesystem allows it. Some free hosts use temporary storage that may be erased after restarts or redeployments.

# Ultra 🏃‍♀️🥸

A 16-week training app that takes Olivia from her current fitness to a **60km ultra marathon**, raising money for **Movember**.

Single-page web app, installable to the home screen, with an optional **Strava** connection. Built to run free on **GitHub Pages**.

**Donate:** https://www.gofundme.com/f/60km-one-cause-countless-conversations

---

## What it does

- **First-open questionnaire** — asks for the runner's name, race date, current longest run, recent 5k/10k PBs, training days per week, terrain, injury status, and goal.
- **Builds the plan from those answers** — a 3-weeks-build / 1-week-recovery progression that scales the long run from where she is now up to a peak dress rehearsal (~70% of race distance), then a 3-week taper. The number of weeks is calculated from the race date.
- **Paces** are derived from the 10k PB.
- **Progress tracking** — tick off weeks; saved on the device.
- **Strava (optional)** — pulls recent runs in via a secure Supabase edge function.
- **Installable** — add to home screen and it opens full-screen with the team photo as the icon.

---

## Deploy to GitHub Pages

1. Create a repository (e.g. **`Ultra`** — GitHub stores it as `Ultra`).
2. Upload everything in this folder to the repo root:
   ```
   index.html
   manifest.json
   sw.js
   icon-192.png
   icon-512.png
   icon-180.png
   supabase/functions/strava-auth/index.ts   (only needed for Strava)
   ```
3. **Settings → Pages →** deploy from `main` / root.
4. Live at `https://<your-username>.github.io/Ultra/`.

The plan and progress work immediately — **Strava is optional** and can be added later.

---

## Strava setup (optional)

Strava OAuth **cannot** run from a static site alone — the token exchange needs your *client secret*, which must never live in public front-end code. A tiny Supabase edge function holds it.

### 1. Create a Strava API app
- Go to https://www.strava.com/settings/api
- Set **Authorization Callback Domain** to your Pages domain, e.g. `your-username.github.io`
- Note your **Client ID** (public) and **Client Secret** (keep private).

### 2. Deploy the edge function (Supabase)
```bash
supabase functions deploy strava-auth --no-verify-jwt
supabase secrets set STRAVA_CLIENT_ID=xxxxx STRAVA_CLIENT_SECRET=xxxxx
```
Your function URL will be:
`https://YOUR-PROJECT-REF.functions.supabase.co/strava-auth`

### 3. Wire it into the app
Open `index.html`, find the `CONFIG` block near the top of the `<script>`, and fill in:
```js
const CONFIG = {
  STRAVA_CLIENT_ID: "12345",                                              // public client id
  EDGE_FN_URL: "https://YOUR-PROJECT-REF.functions.supabase.co/strava-auth",
  SUPABASE_ANON_KEY: "your-anon-key",                                     // safe to expose
};
```
Commit, and the **Connect** button goes live.

> **Note on tokens:** this is built as a *personal, single-user* app — the refresh token is stored in the browser's localStorage. For a multi-user version, store tokens in a Supabase table inside the edge function instead of returning them to the client.

---

## Editing the plan logic

All the training logic lives in `index.html`:
- `buildPlan()` — week-by-week progression, recovery cadence, taper.
- `makeSessions()` — sessions per week, scaled to training days & terrain.
- `derivePaces()` — pace zones from the 10k PB.

No build step, no dependencies — just edit and commit.

---

## A note on the plan

Going from ~15km to 60km in 16 weeks is ambitious but achievable for a healthy runner who commits. The aerobic engine is there; the real limiter is injury, so the plan leans conservative on volume jumps with proper down weeks. **It's a guide, not medical advice — listen to your body over any spreadsheet.**

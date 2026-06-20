#!/usr/bin/env node
// Run once to get your Skylight token, frame ID, and list IDs.
// Usage: SKYLIGHT_EMAIL=you@example.com SKYLIGHT_PASSWORD=yourpass node scripts/get-ids.js

const BASE_URL = "https://app.ourskylight.com/api";
const API_VERSION = "2026-03-01";

const { SKYLIGHT_EMAIL, SKYLIGHT_PASSWORD } = process.env;

if (!SKYLIGHT_EMAIL || !SKYLIGHT_PASSWORD) {
  console.error("Set SKYLIGHT_EMAIL and SKYLIGHT_PASSWORD before running.");
  process.exit(1);
}

async function skyfetch(path, token, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "skylight-api-version": API_VERSION,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} at ${path}`);
  return res.json();
}

(async () => {
  // 1. Authenticate
  console.log("Logging in…");
  const session = await skyfetch("/sessions", null, {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "sessions",
        attributes: { email: SKYLIGHT_EMAIL, password: SKYLIGHT_PASSWORD },
      },
    }),
  });

  const token = session?.data?.attributes?.token;
  if (!token) {
    console.error("Login failed — check your email/password.");
    console.error(JSON.stringify(session, null, 2));
    process.exit(1);
  }
  console.log("\n✓ SKYLIGHT_TOKEN=" + token);

  // 2. List frames
  console.log("\nFetching frames…");
  const frames = await skyfetch("/frames", token);
  const frameList = frames?.data ?? frames;

  if (!Array.isArray(frameList) || frameList.length === 0) {
    console.error("No frames found. Are you on a Plus/Pro plan?");
    process.exit(1);
  }

  for (const frame of frameList) {
    const frameId = frame.id ?? frame?.data?.id;
    const frameName = frame.attributes?.name ?? frame.name ?? frameId;
    console.log(`\n✓ SKYLIGHT_FRAME_ID=${frameId}  (name: "${frameName}")`);

    // 3. List lists for this frame
    console.log("  Fetching lists…");
    try {
      const lists = await skyfetch(`/frames/${frameId}/lists`, token);
      const listData = lists?.data ?? lists;
      for (const list of Array.isArray(listData) ? listData : []) {
        const listId = list.id ?? list?.data?.id;
        const listName = list.attributes?.name ?? list.name ?? listId;
        console.log(`    List: ID=${listId}  name="${listName}"`);
      }
    } catch (e) {
      console.log("  Could not fetch lists:", e.message);
    }
  }

  console.log(
    "\nCopy the values above into your Vercel environment variables.\n" +
    "Set SIRI_AUTH_TOKEN to any secret string you choose."
  );
})().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});

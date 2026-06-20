const BASE_URL = "https://app.ourskylight.com/api";
const API_HEADERS = {
  "Content-Type": "application/json",
  "skylight-api-version": "2026-03-01",
};

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/sessions`, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify({
      data: { type: "sessions", attributes: { email, password } },
    }),
  });
  if (!res.ok) throw new Error(`Skylight login failed: ${res.status}`);
  const json = await res.json();
  const token = json?.data?.attributes?.token;
  if (!token) throw new Error("No token in Skylight login response");
  return token;
}

export async function addListItem(token, frameId, listId, label) {
  const res = await fetch(
    `${BASE_URL}/frames/${frameId}/lists/${listId}/list_items`,
    {
      method: "POST",
      headers: { ...API_HEADERS, Authorization: `Bearer ${token}` },
      body: JSON.stringify({ label, position: 0, status: "pending" }),
    }
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Skylight API error ${res.status}: ${body}`);
  }
}

export async function getFramesAndLists(token) {
  const framesRes = await fetch(`${BASE_URL}/frames`, {
    headers: { ...API_HEADERS, Authorization: `Bearer ${token}` },
  });
  if (!framesRes.ok) throw new Error(`Failed to fetch frames: ${framesRes.status}`);
  const framesJson = await framesRes.json();
  const frames = framesJson?.data ?? [];

  const result = [];
  for (const frame of frames) {
    const frameId = frame.id;
    const frameName = frame.attributes?.name ?? frameId;
    const listsRes = await fetch(`${BASE_URL}/frames/${frameId}/lists`, {
      headers: { ...API_HEADERS, Authorization: `Bearer ${token}` },
    });
    const listsJson = listsRes.ok ? await listsRes.json() : { data: [] };
    const lists = (listsJson?.data ?? []).map((l) => ({
      id: l.id,
      name: l.attributes?.name ?? l.id,
    }));
    result.push({ id: frameId, name: frameName, lists });
  }
  return result;
}

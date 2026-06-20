import { login, addListItem } from "./_skylight.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (req.headers["x-auth-token"] !== process.env.SIRI_AUTH_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { item } = req.body || {};
  if (!item || typeof item !== "string" || !item.trim()) {
    return res.status(400).json({ error: "item is required" });
  }

  try {
    const token = await login(process.env.SKYLIGHT_EMAIL, process.env.SKYLIGHT_PASSWORD);
    await addListItem(token, process.env.SKYLIGHT_FRAME_ID, process.env.SKYLIGHT_GROCERY_LIST_ID, item.trim());
    return res.status(200).json({ success: true, item: item.trim() });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: "Failed to add item to Skylight" });
  }
}

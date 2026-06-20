import { login, getFramesAndLists } from "./_skylight.js";

export default async function handler(req, res) {
  if (req.query.token !== process.env.SIRI_AUTH_TOKEN) {
    return res.status(401).send("<h2>Unauthorized — add ?token=YOUR_SIRI_AUTH_TOKEN to the URL</h2>");
  }

  let html;
  try {
    const skylightToken = await login(process.env.SKYLIGHT_EMAIL, process.env.SKYLIGHT_PASSWORD);
    const frames = await getFramesAndLists(skylightToken);

    const rows = frames.flatMap((frame) =>
      frame.lists.map(
        (list) => `
        <tr>
          <td>${esc(frame.name)}</td>
          <td><code>${esc(frame.id)}</code></td>
          <td>${esc(list.name)}</td>
          <td><code>${esc(list.id)}</code></td>
        </tr>`
      )
    );

    const firstFrameId = frames[0]?.id ?? "";

    html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Skylight Setup</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #ccc; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f4f4f4; }
    code { background: #f0f0f0; padding: 0.1em 0.4em; border-radius: 3px; font-size: 0.9em; }
    .box { background: #f9f9f9; border: 1px solid #ddd; padding: 1rem; border-radius: 6px; margin: 1rem 0; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <h1>Skylight Setup</h1>
  <p>Copy these values into your Vercel environment variables.</p>

  <table>
    <thead><tr><th>Frame Name</th><th>SKYLIGHT_FRAME_ID</th><th>List Name</th><th>List ID</th></tr></thead>
    <tbody>${rows.join("")}</tbody>
  </table>

  <div class="box">
    <strong>SKYLIGHT_FRAME_ID</strong> = <code>${esc(firstFrameId)}</code><br><br>
    Find your Grocery and Todo lists in the table above, then set:<br>
    <strong>SKYLIGHT_GROCERY_LIST_ID</strong> = the List ID for your grocery list<br>
    <strong>SKYLIGHT_TODO_LIST_ID</strong> = the List ID for your todo list
  </div>

  <p>Once all env vars are set in Vercel, <strong>delete or disable this /api/setup endpoint</strong> by removing <code>api/setup.js</code> from the repo.</p>
</body>
</html>`;
  } catch (err) {
    html = `<h2>Error</h2><pre>${esc(err.message)}</pre><p>Check that SKYLIGHT_EMAIL and SKYLIGHT_PASSWORD are set correctly in Vercel.</p>`;
  }

  res.setHeader("Content-Type", "text/html");
  return res.status(200).send(html);
}

function esc(str) {
  return String(str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

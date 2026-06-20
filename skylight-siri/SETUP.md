# Skylight + Siri Setup Guide

No local installs needed beyond a browser and GitHub access.

---

## Step 1 — Deploy to Vercel from GitHub

1. Go to **vercel.com** and sign up (free) or log in
2. Click **Add New Project**
3. Click **Continue with GitHub** and connect your GitHub account
4. Find **jayyeater/meme** in the list and click **Import**
5. Under **Project Name**, change it to `skylight` (Vercel will default to "meme" — override it here)
6. Under **Root Directory**, click **Edit** and type `skylight-siri`
7. Under **Environment Variables**, add these (you'll fill in the IDs in Step 2):

   | Name | Value |
   |------|-------|
   | `SKYLIGHT_EMAIL` | your Skylight login email |
   | `SKYLIGHT_PASSWORD` | your Skylight password |
   | `SKYLIGHT_FRAME_ID` | leave blank for now |
   | `SKYLIGHT_GROCERY_LIST_ID` | leave blank for now |
   | `SKYLIGHT_TODO_LIST_ID` | leave blank for now |
   | `SIRI_AUTH_TOKEN` | make up any secret string, e.g. `family2026` |

8. Click **Deploy** — Vercel builds and gives you a URL like `https://skylight.vercel.app`

---

## Step 2 — Get your Frame and List IDs

1. In your browser, visit:
   ```
   https://YOUR_VERCEL_URL/api/setup?token=YOUR_SIRI_AUTH_TOKEN
   ```
   (Replace both values with yours)

2. The page shows a table of all your Skylight frames and lists with their IDs

3. Go back to your Vercel project → **Settings → Environment Variables** and fill in:
   - `SKYLIGHT_FRAME_ID` — from the table
   - `SKYLIGHT_GROCERY_LIST_ID` — ID of your grocery list
   - `SKYLIGHT_TODO_LIST_ID` — ID of your todo/task list

4. Go to **Deployments** → click the three dots on the latest deploy → **Redeploy** to pick up the new values

---

## Step 3 — Test it

Open your browser and visit (or use curl):

```
# Can't test POST from a browser easily, so use Terminal:
curl -X POST https://YOUR_VERCEL_URL/api/add-grocery-item \
  -H "Content-Type: application/json" \
  -H "X-Auth-Token: YOUR_SIRI_AUTH_TOKEN" \
  -d '{"item": "test milk"}'
```

Should return `{"success":true,"item":"test milk"}` and appear on your Skylight.

---

## Step 4 — Build the Siri Shortcuts (do this twice)

### Grocery Shortcut

1. Open the **Shortcuts** app on your iPhone → tap **+**
2. Tap the name at the top → rename to **`Add to Skylight Grocery List`**
3. Tap **Add Action** → search **"Receive"** → select **Receive Input from Siri** → type: **Text**
4. Tap **+** → search **"If"** → set: Shortcut Input / has any value
   - Leave the **If** body empty
   - Inside **Otherwise**: tap **+** → **Ask for Input** → prompt: "What to add?" → type: Text
5. Tap **+** after the If block → search **"Get Contents of URL"**:
   - URL: `https://YOUR_VERCEL_URL/api/add-grocery-item`
   - Method: **POST**
   - Headers: tap **+** → key `X-Auth-Token` / value `YOUR_SIRI_AUTH_TOKEN`
   - Request Body: **JSON** → tap **+** → key `item` / value: tap variable → **Provided Input** (or the Ask for Input result)
6. Tap **+** → **Speak Text** → type `Added to your Skylight grocery list`
7. Tap **Done**

### Todo Shortcut

Same steps, but:
- Name: **`Add to Skylight Todo List`**
- URL: `https://YOUR_VERCEL_URL/api/add-todo-item`

---

## Step 5 — Share with your wife

1. Open each shortcut → **`···`** → **Share** → **Copy iCloud Link**
2. Text both links to your wife
3. She taps each link → **Add Shortcut** — done, works immediately

---

## Siri phrases

| Say | Result |
|-----|--------|
| "Hey Siri, Add to Skylight Grocery List" | Siri asks what to add |
| "Hey Siri, Add milk to Skylight Grocery List" | Adds milk, no follow-up |
| "Hey Siri, Add to Skylight Todo List" | Siri asks what to add |
| "Hey Siri, Add call dentist to Skylight Todo List" | Adds it hands-free |

---

## Cleanup (optional)

Once everything is working, delete `api/setup.js` from the repo so the setup
page is no longer accessible. It contains your Skylight credentials in the
response — removing it is good hygiene.

---

## Troubleshooting

**Setup page shows "Error"** — check `SKYLIGHT_EMAIL` and `SKYLIGHT_PASSWORD` in Vercel env vars, then redeploy.

**401 on curl test** — `SIRI_AUTH_TOKEN` doesn't match between Vercel and the header you used.

**Item doesn't appear on Skylight** — double-check `SKYLIGHT_FRAME_ID` and list IDs from the setup page.

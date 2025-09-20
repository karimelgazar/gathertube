# YouTube Queue Builder — Requirements & Product Design (RPD)

**Purpose:**
Provide a complete, developer-ready Requirements and Product Design document for a Chrome extension that finds all open YouTube video tabs, extracts their video links, and builds a single "queue" for watching. The extension supports two queue behaviors (temporary watch_videos URL or embedded-player queue), a small dashboard for settings, and an action button to gather videos. The final deliverable should be implementable by Claude Code, Cursor, or a human developer.

---

## 1. High-level summary
- **Name (suggested):** YouTube Queue Builder
- **Platform:** Google Chrome (Manifest V3)
- **Goal:** Let users quickly collect all currently open YouTube video tabs into a single queue, opened in one tab. Provide a dashboard with toggles to control behavior and whether original tabs are closed.

---

## 2. Primary features
1. **Gather YT Videos button** (main action) — finds YouTube `watch?v=` tabs, extracts IDs, opens result.
2. **Queue behaviour toggle**
   - **Default (watch_videos)**: Use `https://www.youtube.com/watch_videos?video_ids=ID1,ID2,...` to open native YouTube player with a temporary playlist.
   - **Embedded queue**: Open (or reuse) a single YouTube tab (or extension page) that uses the YouTube IFrame API to `cuePlaylist()` and provide a UI that mimics native YouTube queue (toggle sidebar with re-order/Delete, show/hide playlist button top-right).
3. **Close tabs toggle** — when enabled, close the original YouTube tabs after gathering.
4. **Dashboard** — minimal UI accessible from extension popup or options page to tweak defaults and view current saved queue (optional preview).
5. **UX** — For embedded queue mode, provide a top-right playlist icon that toggles the playlist panel. Panel supports reorder (drag/drop), delete, play-now, save-as-playlist (optional link to YouTube) and persistent in-session queue only (or persist to local storage to recover on reload).

---

## 3. User flows

### A. Quick gather (default flow)
1. User clicks extension icon -> popup appears.
2. Settings show two toggles (queue behaviour & close tabs) and a primary button `Gather YT Videos`.
3. User clicks `Gather YT Videos`.
4. Extension queries all tabs, finds `youtube.com/watch?v=...` pages, extracts video IDs.
5. If no videos found: show friendly message in popup.
6. If default behaviour (watch_videos): open a new tab with `https://www.youtube.com/watch_videos?video_ids=ID1,ID2...`.
7. If close‑tabs toggle enabled: close the original video tabs (except the newly opened queue tab).

### B. Embedded queue flow
1. Steps 1–4 same.
2. Open extension's embedded player page (extension page or a chosen YouTube tab) and pass the collected IDs.
3. Use YouTube IFrame API to `cuePlaylist` with the array of IDs.
4. Display a top-right playlist icon in the embedded player page; when clicked, open a playlist panel that visually and functionally matches native YouTube queue: reorder via drag/drop, delete items, play now, and optionally save the queue to `watch_videos` URL or provide a "Open in YouTube" link.
5. If close‑tabs toggle enabled: close original tabs.

---

## 4. Technical architecture

### Core pieces
- `manifest.json` (MV3)
- `popup.html` + `popup.js` — light settings UI + Gather button
- `background/service_worker.js` — uses `chrome.tabs.query` and handles tab creation/closing and messaging
- `options.html` + `options.js` (optional) — persistent configuration for defaults
- `embed_page.html` + `embed_page.js` — (only used for Embedded queue mode) contains the YouTube IFrame player and playlist UI
- `content_scripts` (optional) — only if you need to interact with YouTube DOM. Avoid if possible.

### Permissions
- `"permissions"`: ["tabs", "storage"]
- `"host_permissions"`: ["*://*.youtube.com/*"]
- Note: If only reading tab URLs, host_permissions may not be strictly necessary, but needed if injecting content scripts or opening youtube.com extension pages / interacting with page DOM.

### Storage
- Use `chrome.storage.local` to save user preferences (queue mode default, close-tabs default) and optionally keep the last queue so the embedded page can restore it on reload.

### Messaging
- Popup -> Service worker: Request `gatherVideos` action.
- Service worker -> embed_page: open tab with query params or send a message to existing tab with collected IDs.

---

## 5. Implementation details & snippets

### 5.1 manifest.json (suggested)
```json
{
  "manifest_version": 3,
  "name": "YouTube Queue Builder",
  "version": "1.0",
  "permissions": ["tabs", "storage"],
  "host_permissions": ["*://*.youtube.com/*"],
  "action": {"default_popup": "popup.html"},
  "background": {"service_worker": "background.js"},
  "icons": { "16": "icons/16.png", "48": "icons/48.png", "128": "icons/128.png" }
}
```

### 5.2 popup.html (UI)
- Contains: two toggles and a primary `Gather YT Videos` button.

### 5.3 popup.js (logic)
- Read settings from `chrome.storage.local`.
- On click: send message to service worker: `{ action: 'gather' }`.
- Display success/error feedback.

### 5.4 background.js (service worker)
Pseudo-steps:
1. `chrome.runtime.onMessage` listening for `gather`.
2. `chrome.tabs.query({})` -> filter for `youtube.com/watch` URLs.
3. Extract `v` param (video id) and preserve tab ids.
4. If `mode === 'watch_videos'`:
   - Build `https://www.youtube.com/watch_videos?video_ids=...` URL.
   - `chrome.tabs.create({ url })`.
5. Else if `mode === 'embed'`:
   - If an existing embed page/tab exists, activate it and `chrome.tabs.sendMessage` or pass via `chrome.tabs.update({ url: extension_page_url?ids=... })`.
   - Else `chrome.tabs.create({ url: chrome.runtime.getURL('embed_page.html') + '?ids=...' })`.
6. If close-tabs enabled: `chrome.tabs.remove([...])` (skip the new tab that was just opened).

**Important:** For MV3 service worker, careful with async flows and early termination — return true or use promises appropriately.

### 5.5 embed_page.html / embed_page.js
- Use official [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference) loaded with `<script src="https://www.youtube.com/iframe_api"></script>`.
- On API ready, create the player and call `player.cuePlaylist({playlist: ["ID1","ID2", ...]})`.
- Playlist panel UI:
  - A floating top-right button with a playlist icon.
  - The panel slides out from the right; it lists queued videos with thumbnails, titles, drag handles, delete icons.
  - Reordering the list calls `player.cuePlaylist({playlist: newOrder})` or `player.loadPlaylist` depending on current playback state.
  - Clicking a list item seeks to that video (call `player.playVideoAt(index)` or `player.cuePlaylist` + `playVideoAt`).
- Persist the current queue in `chrome.storage.local` so refresh retains state (session-persistent only).

**Mimic native UI:** To match the native YouTube queue look and feel, copy these behaviors:
- Compact list with thumbnail + title + duration.
- Drag handle at left, action buttons on hover (delete, play now).
- Show total count and an option to clear all.

Note: Exact pixel-perfect UI is not required, but behaviors (reorder, delete, play now, toggle panel) should match.

---

## 6. Edge cases & constraints
- Tabs with shorteners (e.g., `youtu.be/<id>`) should be detected and parsed.
- Duplicates: remove duplicate video IDs or offer option to keep duplicates.
- Large number of tabs: Chrome may have limits on URL length — if the `watch_videos` query string exceeds safe limits, fallback to opening embed page instead or chunk into multiple queues and prompt user.
- Private/incognito tabs: cannot be accessed unless extension is enabled for incognito.
- Non-video YouTube pages: filter strictly to `watch` pages.
- Permission prompts: explain to user why `tabs` and `storage` permissions are needed.

---

## 7. Security & policy considerations
- Avoid automating logged-in UI actions on YouTube pages (no simulated clicks on YouTube’s DOM) — use `watch_videos` or IFrame API instead.
- Respect user data: do not upload video IDs to any remote server. Keep operations local.
- Ensure the extension's Privacy Policy describes storage of settings and ephemeral queue.
- MV3 compliance: background scripts must be service_worker-based and minimal.

---

## 8. UX details and text copy
- Popup labels:
  - `Queue behavior: [watch_videos | Embedded player]` (toggle switch)
  - `Close original tabs after gather` (checkbox/toggle)
  - `Gather YT Videos` (primary button)
- Error messages:
  - `No YouTube video tabs found.`
  - `Too many videos to open via watch_videos URL; switching to embedded queue.`
  - `Failed to create queue — please try again.`

---

## 9. Acceptance criteria (how to verify)
1. Clicking Gather when there are YouTube watch tabs opens a single new tab that plays all videos sequentially.
2. Default mode uses `watch_videos?video_ids=` and does not save anything to the user account automatically.
3. Embedded mode opens the extension page with an IFrame player and a playlist panel that supports reorder/delete/play-now and visually behaves like native queue.
4. When Close Tabs is enabled, original video tabs are closed (but not the new queue tab).
5. Settings persist between browser restarts using `chrome.storage.local`.
6. No network calls to external servers; everything runs locally in the extension.

---

## 10. Deliverables for the implementer
- Complete extension source code (manifest, icons, HTML/JS/CSS) ready to load as unpacked extension.
- README with install/test instructions (how to enable extension, manifest keys, permissions, incognito notes).
- Basic automated tests (if possible) or manual QA checklist.

---

## 11. Helpful code snippets and utilities
- URL parsing helpers: parse `watch?v=` and `youtu.be/ID` formats.
- Utility to build `watch_videos` and percent‑encode IDs.
- Fallback logic when `watch_videos` URL would exceed length (switch to embedded page).

---

## 12. Implementation tips & gotchas
- MV3 service_worker lifespan: use async/await and return promises — avoid long-running synchronous tasks in the worker.
- When closing tabs after creating queue, ensure the new tab's ID is known and excluded from `chrome.tabs.remove` calls.
- IFrame API: `player.cuePlaylist({playlist: ids})` expects video IDs only, not full URLs.
- Thumbnails: can be fetched with `https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg` for list UI.

---

## 13. Mockups (textual)
- **Popup:** two toggles (stacked), then a wide blue `Gather YT Videos` button.
- **Embed page:** large YouTube player centered, small floating top-right playlist button. Clicking shows a right-side panel with a list; drag-to-reorder; each list item row: [drag handle] [thumbnail] [title] [duration] [delete]

---

## 14. Next steps for implementer
1. Implement the simple MVP using `watch_videos` only (fastest path).
2. Add storage and settings UI.
3. Implement embed page + playlist panel (more work: IFrame API + UI).  
4. Add UX polish and QA.

---

**End of RPD**

If you want, I can also produce:
- A ready-to-load extension zip with the MVP `watch_videos` implementation.
- Full code skeleton (file-by-file) including `popup.js`, `background.js`, `embed_page.js`, and example CSS.
- Pixel mockups for the popup and embed playlist panel.

Tell me which of those you want next.


# AI Group Poster — Facebook Automation Assistant

A production-ready Chrome / Edge browser extension designed for managing Facebook Group posting workflows through a **queue-based, human-in-the-loop process**.

The extension streamlines the workflow of online merchants, community managers, and local businesses by organizing target Facebook groups, preparing rich posts, generating AI captions, maintaining an active posting queue, and offering quick-copy in-page tools.

> **100% Platform Compliant & Safe**:
> AI Group Poster **does not** bypass CAPTCHAs, rate limits, account restrictions, login protections, or platform security checks. The user stays in complete control of final posting actions.

---

## 🌟 Key Features

1. **Human-in-the-Loop Posting Queue**:
   - Deterministic queue state machine: `PENDING → READY → IN_PROGRESS → WAITING_FOR_USER → POSTED / SKIPPED / FAILED`.
   - Queue controls: Start, Pause, Resume, Skip, Retry, Reorder, and Clear Completed.
   - Pacing delays: Configurable wait timer between posts (e.g., 15s–60s) to maintain a natural browsing cadence.

2. **Facebook Groups Manager**:
   - Single group adding with automatic URL normalization and Facebook Group ID extraction.
   - Bulk group addition (one URL per line).
   - CSV Import with pre-import validation summary (valid rows, invalid URLs, duplicate detection).
   - Search, filter by category/status/location, and export to CSV/JSON.

3. **Post Composer & Dynamic Templates**:
   - Structured post fields: Product Name, Price, Old Price, Description, Features, Location, Delivery Info, Contact Info, Call To Action.
   - Multiple image uploader with preview thumbnails and reordering.
   - Reusable template engine supporting variables: `{product_name}`, `{price}`, `{location}`, `{contact_info}`, etc.
   - Real-time live formatted preview.

4. **Multi-Provider AI Caption Generator**:
   - Modular provider architecture: **OpenAI-compatible** (GPT-4o, Groq, Ollama), **Google Gemini** (Gemini 1.5 Flash/Pro), and **Custom HTTP API**.
   - Multi-language copy generation: **Bangla (বাংলা)**, **Banglish (Phonetic English)**, and **English**.
   - Tone & Style presets: Marketplace, Professional, Friendly, Sales, Short, Minimal, Detailed.
   - One-click refinements: *Regenerate*, *Shorten*, *Expand*, *Make Professional*, *Make Natural*, and *Translate*.

5. **In-Page Facebook Helper Dock**:
   - Clean, unobtrusive floating widget injected via **Shadow DOM** on Facebook Group pages (`*://*.facebook.com/groups/*`).
   - One-click clipboard actions: `Copy Full Post`, `Copy Caption`, `Copy Title`, `Copy Price`, `Copy Contact`.
   - Workflow buttons: `Mark as Posted & Next`, `Skip Group`, `Pause Queue`, `Open Dashboard`.

6. **Posting History & Audit Logs**:
   - Permanent log of confirmed posts with timestamps, duration, and notes.
   - Terminal-style diagnostic stream with log severity filters (`INFO`, `SUCCESS`, `WARNING`, `ERROR`).
   - Export history and logs to CSV/JSON.

7. **Data Backup & Restore**:
   - One-click full JSON database export (`ai-group-poster-backup.json`).
   - Schema validation and inspection before restoring.
   - Merge or Replace restore modes.

8. **Optional Webhook / n8n Automation**:
   - Disabled by default.
   - Dispatches real-time event webhooks to n8n, Make, or Zapier when posts are ready or confirmed.

---

## 🚀 Quick Start & Installation

### Step 1: Clone or Build the Extension
```bash
# In the project directory:
npm.cmd install
npm.cmd run build
```
The compiled extension will be in the `dist/` directory.

### Step 2: Load Unpacked in Chrome or Edge
1. Open Google Chrome or Microsoft Edge.
2. In the address bar, go to:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
3. Toggle on **Developer mode** (top-right corner).
4. Click **Load unpacked** (top-left corner).
5. Select the **`dist`** folder inside this project directory:
   ```text
   d:\facboock grup atumaition\dist
   ```
6. The **AI Group Poster** extension icon will appear in your browser toolbar!

---

## ⚙️ Configuration & AI Setup

1. Click the AI Group Poster icon and click **Open Full Dashboard**.
2. Go to the **Settings** tab in the sidebar.
3. Select your AI Provider:
   - **OpenAI (or Compatible)**: Enter your OpenAI API Key and select model `gpt-4o-mini` (or set a custom endpoint like Groq or OpenRouter).
   - **Google Gemini**: Enter your Google AI Studio API Key and select model `gemini-1.5-flash`.
   - **Custom API**: Enter your custom endpoint URL and authorization header.
4. Click **Save Changes**.

---

## 📋 The Human-in-the-Loop Workflow

```text
Add Groups (or Import CSV)
            ↓
   Compose Product Post
            ↓
  Generate AI Caption Hook
            ↓
  Add Groups to Queue & Start
            ↓
 Extension Opens Facebook Group Tab
            ↓
 Floating Helper Displays Prepared Post
            ↓
 User Clicks "Copy Full Post" & Pastes
            ↓
 User Manually Confirms & Clicks "Post"
            ↓
 User Clicks "Mark as Posted & Next"
            ↓
 History Recorded → Pacing Delay → Next Group
```

---

## 🔒 Extension Permissions Explained

| Permission | Justification |
| :--- | :--- |
| `storage` | Saves groups, posts, templates, queue state, history, and settings locally in Chrome storage. |
| `tabs` | Navigates the browser to the target Facebook group URL when moving through the queue. |
| `notifications` | Notifies the user when a group is ready for review, queue is paused, or session finishes. |
| `host_permissions: https://*.facebook.com/*` | Enables page detection and mounts the helper dock panel on Facebook group pages. |

---

## 🛠️ Development Scripts

```bash
# Run automated tests (Vitest)
npm.cmd test

# Type-check TypeScript codebase
npm.cmd run typecheck

# Build extension into dist/
npm.cmd run build

# Start Vite preview/dev
npm.cmd run dev
```

---

## ❓ Troubleshooting

- **Helper panel does not appear on Facebook:**
  - Refresh the Facebook group page. Ensure the URL contains `/groups/<group_slug>/`.
  - Verify that "In-Page Helper Dock" is enabled in **Settings → Facebook & Helper**.
- **AI caption generation fails:**
  - Check your API key and network connection in **Settings → AI Configuration**.
- **Data missing after restart:**
  - All data is persisted to `chrome.storage.local`. You can create and export backups at any time via **Settings → Backup & Storage**.

---

## 📄 License
MIT License. Built for ethical, human-controlled marketplace and group community management.

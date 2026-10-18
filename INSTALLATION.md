# Installation Guide — AI Group Poster Extension

Follow these instructions to install and run the **AI Group Poster** extension in Google Chrome, Microsoft Edge, Brave, or any Chromium-compatible browser.

---

## 📁 Prerequisites

- **Node.js**: v18 or higher (v24.x tested)
- **Chromium-based browser**: Google Chrome, Microsoft Edge, Brave, Opera, or Vivaldi.

---

## 🛠️ Step 1: Build the Extension

Open PowerShell or your terminal in the project directory:

```powershell
# Navigate to the workspace
cd "d:\facboock grup atumaition"

# Build the production bundle
npm.cmd run build
```

Once the build finishes, you will see:
```text
✨ Build successfully completed! Load unpacked folder: dist/
```

Verify that the `dist/` directory exists and contains:
- `manifest.json`
- `service-worker.js`
- `facebook-content.js`
- `icons/`
- `src/pages/dashboard/index.html`
- `src/pages/popup/index.html`
- `src/pages/options/index.html`
- `assets/`

---

## 🌐 Step 2: Load Unpacked in Google Chrome

1. Open **Google Chrome**.
2. Type `chrome://extensions` in the address bar and press **Enter**.
3. In the upper-right corner of the Extensions page, toggle **Developer mode** to **ON**.
4. In the upper-left corner, click the **Load unpacked** button.
5. In the file picker dialog, navigate to your project and select the **`dist`** directory:
   ```text
   d:\facboock grup atumaition\dist
   ```
6. Click **Select Folder**.
7. **AI Group Poster** will now appear in your list of installed extensions.

---

## 🌐 Step 2 (Alternative): Load Unpacked in Microsoft Edge

1. Open **Microsoft Edge**.
2. Type `edge://extensions` in the address bar and press **Enter**.
3. In the left-hand menu, toggle **Developer mode** to **ON**.
4. Click **Load unpacked** at the top of the page.
5. Select the **`dist`** directory:
   ```text
   d:\facboock grup atumaition\dist
   ```
6. Click **Select Folder**.

---

## 📌 Step 3: Pin the Extension to the Toolbar

1. Click the **Puzzle Piece** icon (Extensions menu) in your browser toolbar (next to the address bar).
2. Find **AI Group Poster**.
3. Click the **Pin** icon to pin the extension directly to your toolbar.

---

## 🧪 Step 4: Verify Functionality

### 1. Test the Extension Popup
- Click the **AI Group Poster** icon in the browser toolbar.
- The compact popup window will open displaying current queue metrics, idle status, and the **Open Full Dashboard** button.

### 2. Test the Full Dashboard Tab
- In the popup, click **Open Full Dashboard** (or right-click the icon and choose **Options**).
- The full SaaS dashboard tab will open.
- If it is your first time, the **Onboarding Wizard** will appear.
- Click **Load Demo Data** to populate 5 sample Facebook groups, pre-composed listings (e.g. Yamaha FZS V3), and pre-configured templates!

### 3. Test the Post Composer & AI Caption Generator
- Go to the **Composer** tab.
- Review the pre-loaded fields and observe the **Live Template Preview** updating in real time.
- Go to the **AI Writer** tab to test prompt adjustments and styles.

### 4. Test the Human-in-the-Loop Facebook Workflow
- In the **Queue** tab, select groups and click **Start Queue**.
- The extension opens the target Facebook Group URL in a tab.
- On the Facebook group page, observe the **AI Group Poster** helper panel in the lower-right corner.
- Use `[Copy Full Post]` to test copying prepared content.
- Click `[Mark as Posted & Next]` to test marking the item as posted, pacing delays, and moving to the next item in your queue!

---

## 🔄 Updating After Code Changes

Whenever you modify code in the `src/` directory:
1. Run:
   ```powershell
   npm.cmd run build
   ```
2. In `chrome://extensions`, locate **AI Group Poster** and click the **Reload (circular arrow)** icon.

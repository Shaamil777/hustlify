# Hustlify – B2B Business Assessment & Voice Intelligence Platform

A high-ticket, minimalist, executive assessment form built with **Next.js 14**, **Tailwind CSS**, and **Vercel Blob Storage**. Collects deep operational insights and voice notes across 28 structured questions with real-time sync to **Google Sheets**, **Telegram**, and a **built-in Admin Dashboard**.

---

## 🌟 Key Highlights

- **Executive & Minimalist Design:** Linear / Apple-inspired deep slate aesthetic with subtle borders, glowing accents, and high-performance micro-interactions.
- **Voice Note Input Fields:** Interactive recording with live audio waveform visualizer, recording timer, in-browser playback preview, and re-record capability for:
  - **Q.8:** Biggest business pain point
  - **Q.9:** Primary goal of consultation
  - **Q.22:** Current sales & marketing strategy
  - **Q.27:** Current sales training method
- **Dynamic Social Media Manager (Q.14):** Add unlimited social channels (LinkedIn, X/Twitter, Instagram, Facebook, YouTube, Website) with an intuitive "Add Link" button.
- **Multi-Destination Data Sync:**
  1. **Google Sheets:** Every submission appends as a new row with clickable `=HYPERLINK(..., "▶️ Play Voice Note")` links.
  2. **Vercel Blob:** Direct high-speed CDN audio hosting for voice notes.
  3. **Built-in Admin Dashboard (`/admin`):** Passcode-protected table with audio player to listen to recordings, review answers, search, and export CSV.
  4. **Instant Telegram Alerts (Optional):** Receive new lead notifications with playable voice notes directly on your phone.
- **Local Storage Draft Auto-Save:** Ensures prospective clients never lose long answers if they accidentally refresh or navigate away.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note on Local Voice Notes:** If `BLOB_READ_WRITE_TOKEN` is not set during local testing, audio recordings are automatically stored locally in `/public/uploads` so the app works out of the box without any setup!

---

## 📊 How to Connect Google Sheets (1 Minute Setup)

1. Open your target **Google Sheet** (or create a blank new one).
2. Click **Extensions** > **Apps Script** in the top menu.
3. Replace all code in the script editor with the code in [`google-sheets-script.js`](./google-sheets-script.js).
4. Click **Save** (disk icon or `Ctrl + S`).
5. Click the blue **Deploy** button (top right) > **New deployment**.
6. Click the gear icon beside "Select type" > select **Web app**.
7. Set:
   - **Description:** `Hustlify Webhook`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone` *(Crucial so the form backend can post)*
8. Click **Deploy** and authorize permissions.
9. Copy the generated **Web App URL** (starts with `https://script.google.com/macros/s/...`).
10. Add it to your `.env.local` or Vercel Environment Variables:
    ```env
    GOOGLE_SHEET_WEBHOOK_URL="https://script.google.com/macros/s/..."
    ```

Every submission will automatically create a row with formatted text answers and clickable audio links!

---

## 🔒 Built-in Admin Dashboard (`/admin`)

To view, search, and listen to submissions directly in your browser:
1. Navigate to `http://localhost:3000/admin` (or `https://your-domain.vercel.app/admin`).
2. Enter your admin passcode:
   - Default: `admin123` (Set custom in `.env` via `ADMIN_PASSWORD="your-secure-password"`).
3. Features:
   - In-app custom audio player for Q8, Q9, Q22, and Q27.
   - 1-click **Export CSV** download.
   - Search by company name, contact, email, or industry.

---

## 🎙️ Deploying to Vercel with Vercel Blob

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. In your Vercel Project Dashboard:
   - Go to **Storage** tab > click **Create Database** > select **Blob**.
   - Connect the Blob store to your project. This automatically injects `BLOB_READ_WRITE_TOKEN` into your production environment!
4. Under **Settings** > **Environment Variables**, add:
   - `GOOGLE_SHEET_WEBHOOK_URL` = your Google Apps Script URL.
   - `ADMIN_PASSWORD` = your desired admin passcode.
   - *(Optional)* `TELEGRAM_BOT_TOKEN` & `TELEGRAM_CHAT_ID`
5. Click **Deploy**. That's it!

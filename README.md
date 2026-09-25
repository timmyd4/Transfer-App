# Transfer App

A private, personal web app for sending small files between your phone and
your computer in real time. It looks like a File Explorer "Details" view:
a sortable file list plus a details pane showing type, size and upload time.
Only you can log in.

- **Frontend:** React + Vite
- **Backend:** Supabase (Auth, Database, Realtime, Storage) — free tier
- **Hosting:** GitHub Pages, deployed automatically by GitHub Actions
- **Installable** on your Android phone as a PWA (home-screen app icon, full screen)

Everything below is written for a beginner. Follow the steps in order the
first time you set this up. You'll do three things: create a Supabase
project, tell GitHub about your Supabase keys, and turn on GitHub Pages.

---

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up / log in (free).
2. Click **New Project**. Pick any name (e.g. "transfer-app"), set a database
   password (save it somewhere safe — you won't need it day-to-day), pick the
   region closest to you, and click **Create new project**. Wait ~1-2 minutes
   for it to finish setting up.
3. In the left sidebar, click the **SQL Editor** icon.
4. Click **New query**.
5. Open the file [`supabase/schema.sql`](./supabase/schema.sql) from this
   repo, copy its **entire contents**, and paste it into the SQL editor.
6. Click **Run** (bottom right). You should see "Success. No rows returned."
   This creates the `messages` table, locks it down so only you can see your
   own rows (Row Level Security), turns on realtime updates for it, and
   creates a private storage bucket called `attachments` for your files.
7. In the left sidebar, click **Settings** (gear icon) → **API**.
   You'll need two values from this page in a moment:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon / public** key (a long string — Supabase sometimes calls this the
     "publishable" key). **Do not use the `service_role` key anywhere in this
     app** — that one is secret and must never go in the frontend.

### Create your one and only account

8. Still in Supabase, go to **Authentication** → **Users** (left sidebar).
9. Click **Add user** → **Create new user**. Enter the email and password you
   want to use to log in, and make sure **"Auto Confirm User"** is checked so
   you don't need to click an email link. Click **Create user**.

### Turn off public sign-ups (important!)

Since this app is only for you, stop anyone else from being able to register:

10. Go to **Authentication** → **Sign In / Providers** (or **Settings** →
    **Authentication**, the exact label depends on your Supabase version).
11. Find the setting called **"Allow new users to sign up"** (sometimes under
    "User Signups") and **turn it OFF**.
12. Save. Now only the account you created in step 9 can log in — nobody can
    create a new one, even if they find your site's URL.

### Add your future GitHub Pages URL to Supabase

Your site will be published at `https://<your-github-username>.github.io/Transfer-App/`
(replace `<your-github-username>` with your actual GitHub username).

13. In Supabase, go to **Authentication** → **URL Configuration**.
14. Set **Site URL** to your GitHub Pages URL above.
15. Under **Redirect URLs**, add that same URL too.
16. Save.

---

## 2. Connect GitHub to Supabase (for automatic deploys)

Your Supabase URL and key need to reach the GitHub Actions build without ever
being committed to the repo. GitHub **Secrets** handle this.

1. Open your repository on GitHub.com.
2. Go to **Settings** (top tab of the repo, not your account settings) →
   **Secrets and variables** → **Actions**.
3. Click **New repository secret**. Add:
   - Name: `VITE_SUPABASE_URL` → Value: your Project URL from step 1.7
4. Click **New repository secret** again. Add:
   - Name: `VITE_SUPABASE_ANON_KEY` → Value: your anon/public key from step 1.7
5. That's it — the deploy workflow (`.github/workflows/deploy.yml`) will read
   these automatically every time it builds.

### Turn on GitHub Pages

6. Still in repo **Settings**, click **Pages** in the sidebar.
7. Under **Build and deployment** → **Source**, choose **GitHub Actions**.
8. Push this project to the `main` branch of your GitHub repo (see below) —
   that push will trigger the **Deploy to GitHub Pages** workflow
   automatically. Watch its progress under the **Actions** tab of your repo.
9. Once it finishes (green checkmark), your app is live at
   `https://<your-github-username>.github.io/Transfer-App/`.

> If your repository name is not `Transfer-App`, open `vite.config.js` and
> change the `REPO_NAME` constant at the top to match your actual repo name,
> then commit that change — the site path must match exactly.

---

## 3. Run it on your computer (for local development)

1. Install [Node.js](https://nodejs.org) (LTS version) if you don't have it.
2. In this project folder, copy the example environment file:
   ```
   cp .env.example .env
   ```
   (On Windows PowerShell: `Copy-Item .env.example .env`)
3. Open the new `.env` file and paste in your Supabase Project URL and
   anon/public key from step 1.7. It should look like:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
   This file is listed in `.gitignore`, so it will never be committed.
4. Install dependencies:
   ```
   npm install
   ```
5. Start the local dev server:
   ```
   npm run dev
   ```
6. Open the URL it prints (usually `http://localhost:5173`) in your browser
   and log in with the account you created in step 1.9.

To double check everything still builds correctly (this is also what GitHub
Actions runs before deploying):
```
npm run build
```

---

## 4. Install it on your Samsung Android phone

1. Make sure you've completed the GitHub Pages deploy above (step 2.9), so
   the app is live on the internet.
2. On your phone, open **Chrome** and go to
   `https://<your-github-username>.github.io/Transfer-App/`.
3. Log in with your account.
4. Tap the **three-dot menu** (top right) → **Add to Home screen** (on some
   versions this shows as **Install app**).
5. Confirm. An icon will appear on your home screen that opens the app full
   screen, just like a normal app.
6. The first time you open it (on phone or PC), it will ask **"Which device
   is this?"** — pick **Phone** on your phone and **PC** on your computer.
   You can change this anytime from the **Settings** page in the app.

---

## How it works / project structure

```
src/
  lib/
    supabaseClient.js   Creates the Supabase client from your .env values
    device.js           Remembers "Phone" or "PC" in localStorage
    uploadFile.js        Uploads a file to Storage + inserts its DB row
    downloadFile.js       Creates a signed URL and opens it
    deleteFile.js          Removes the Storage object + DB row
    fileMeta.js             Formats file size, type label, and dates
    useFiles.js               Fetches the file list + realtime subscription
    useUpload.js               Upload state (in progress / error) as a hook
  context/
    AuthContext.jsx      Tracks whether you're logged in, app-wide
    useAuth.js            Hook to read that login state anywhere
  components/
    ProtectedRoute.jsx   Redirects to /login if you're not signed in
    Header.jsx           Top bar with the current device + settings link
    Toolbar.jsx           "Upload File" button + drag-and-drop hint
    FileTable.jsx          The sortable file list (Explorer "Details" view)
    FileIcon.jsx             Small icon, tinted by file category
    DetailsPane.jsx            Selected file's info + download/delete
  pages/
    LoginPage.jsx        Email + password login (and one-time sign up)
    HomePage.jsx         The main file explorer screen
    SettingsPage.jsx     Change device name, log out
supabase/
  schema.sql             Run this once in the Supabase SQL editor
.github/workflows/
  deploy.yml              Builds and publishes to GitHub Pages on every push
```

Every uploaded file is one row in the `messages` table (name, size, type,
which device sent it, and when). Row Level Security makes sure Supabase only
ever returns *your* rows to *you* — even though the app uses a public anon
key in the browser, nobody else can read or write your data. The files
themselves live in a private Storage bucket, and are only ever accessed
through short-lived signed download links.

Click a file in the list to select it and see its details (type, size,
who sent it, exact upload date/time) in the pane beside the list (or below
it on a phone). Double-click a row, or use the Download button, to open it.
You can also drag a file straight from your desktop into the list to upload
it, or press Delete on your keyboard while a file is selected.

### Ideas for later
- Add columns to sort by, or a search/filter box, for a big file list
- Support pasting an image directly from the clipboard
- Add push notifications when a new message arrives
- Show upload progress for large files

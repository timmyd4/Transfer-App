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

The big picture: every uploaded file is one row in Supabase's `messages`
table (name, size, type, which device sent it, when). Row Level Security
makes sure Supabase only ever returns *your* rows to *you* — even though the
app uses a public anon key in the browser, nobody else can read or write your
data. The files themselves live in a private Storage bucket and are only
ever accessed through short-lived signed download links, never a public URL.

Below is what every file in this project does, and *why* it exists as its
own piece rather than being lumped into something bigger.

### Entry point & routing

- **`src/main.jsx`** — Boots React: finds the `<div id="root">` in
  `index.html` and renders `<App />` into it. This is the one file every
  Vite + React project starts from.
- **`src/App.jsx`** — Defines the three pages/routes (`/login`, `/`,
  `/settings`) and wraps them in `AuthProvider` so login state is available
  everywhere. Uses **`HashRouter`** (URLs like `#/settings`) instead of the
  more common `BrowserRouter` *because* GitHub Pages only serves static
  files — a real route like `/settings` would 404 on refresh since there's
  no server to redirect it back to `index.html`. Hash routes never leave
  `index.html`, so they always work.

### `src/context/` — who's logged in, app-wide

- **`auth-context.js`** — Just `createContext()`. Split into its own file
  (instead of living in `AuthContext.jsx`) because of an ESLint rule
  (`react-refresh/only-export-components`) that wants files exporting a
  component to *only* export that component — mixing in a plain
  context/hook export breaks React Fast Refresh during development.
- **`AuthContext.jsx`** — The `<AuthProvider>` component. On load it asks
  Supabase for any existing session (`supabase.auth.getSession()`) so
  reopening the installed app doesn't force a fresh login, then subscribes
  to `supabase.auth.onAuthStateChange()` so every page reacts instantly the
  moment you log in or out. Exposes `{ session, user, loading, signOut }`.
- **`useAuth.js`** — The `useAuth()` hook other components call to read
  that context. Throws a clear error if used outside `<AuthProvider>`,
  which turns "silent undefined bug" into "obvious error message" the
  moment you make a mistake.

### `src/lib/` — logic with no UI in it

Kept separate from components so the *rules* (how uploading works, how
dates are formatted) can be tested, reused, or changed without touching any
JSX.

- **`supabaseClient.js`** — Creates the one shared Supabase client from
  your `.env` values (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) and
  exports `ATTACHMENTS_BUCKET = 'attachments'` as a single source of truth
  for the bucket name, so it's never typo'd in two places. Logs a clear
  console error if the env vars are missing instead of failing silently.
- **`device.js`** — `getDeviceName()` / `setDeviceName()` wrap
  `localStorage` in try/catch (private browsing can throw on access) and
  define `DEVICE_OPTIONS = ['Phone', 'PC']` once, so the Settings page and
  the first-run prompt always show the same two choices.
- **`uploadFile.js`** — `uploadFile({ user, file, device })` does the two
  things every upload needs, in order: push the bytes to Storage at
  `<user.id>/<random>-<filename>`, then insert the matching database row
  (name, size, MIME type, device). Rejects anything over 20MB
  (`MAX_FILE_SIZE_BYTES`) *before* uploading, so you don't wait on a big
  transfer just to have it rejected. One function, so the Toolbar button
  and the drag-and-drop handler can't drift out of sync with each other.
- **`downloadFile.js`** — `downloadFile(file)` asks Supabase Storage for a
  60-second signed URL and opens it. A private bucket has no public URLs by
  design, so every single download has to mint one of these on the spot.
  Centralized here because both the details pane's Download button *and*
  double-clicking a row need identical behavior.
- **`deleteFile.js`** — `deleteFile(file)` removes the Storage object
  *and* the database row. Deletes the file first: if that step fails, the
  row stays and you still have your data; if the row-delete failed first
  and Storage succeeded, you'd have a "ghost" database entry pointing at a
  file that no longer exists.
- **`fileMeta.js`** — Pure formatting, no network calls:
  - `formatBytes(bytes)` → `"1.4 MB"` style human-readable sizes.
  - `getFileKind(fileType, fileName)` → turns a MIME type/extension into a
    friendly label (`"PNG Image"`, `"PDF Document"`) *and* an icon
    category, which is what picks the color/shape in `FileIcon.jsx`.
  - `formatDateShort(iso)` → compact date for the table column.
  - `formatDateLong(iso)` → `{ date, time }` split out for the details
    pane, matching your ask for "the date, time, and other good details"
    to be clearly separated rather than one crammed timestamp string.
- **`useFiles.js`** — The `useFiles(sort)` hook: fetches the file list once
  on load, then keeps it live by subscribing to Supabase Realtime
  `postgres_changes` (INSERT/DELETE) so a file uploaded from your phone
  appears on your PC instantly with no refresh. Also holds the
  column-sort logic (`compareFiles`/`rawCompare`) — sorting happens on the
  already-fetched list in the browser rather than re-querying Supabase
  every time you click a column header, which is instant and needs no
  extra network round-trip.
- **`useUpload.js`** — Wraps `uploadFile()` in React state
  (`uploading`, `error`) so any component can trigger an upload and
  automatically get a loading spinner / error message for free, without
  re-implementing that state itself.

### `src/components/` — reusable pieces of UI

- **`Header.jsx`** — Top bar: app title, a badge showing which device
  you're on (from `device.js`), and a link to Settings. Reads the device
  name directly rather than through props since it's purely informational
  and every page that renders `<Header>` needs it the same way.
- **`ProtectedRoute.jsx`** — A wrapper component: shows a loading state
  while auth is still resolving, redirects to `/login` if there's no
  session, otherwise renders its children. Centralizing this in one place
  means `App.jsx` can guard both `/` and `/settings` with a single
  one-line wrapper each instead of repeating the same login check in every
  page component.
- **`Toolbar.jsx`** — The "+ Upload File" button and its hidden
  `<input type="file">`. Clicking the visible button programmatically
  clicks the invisible file input (`inputRef.current.click()`) because
  native file inputs are impossible to style consistently across
  browsers — this gives you a normal-looking button with the browser's
  real file picker underneath. Resets the input's value after every pick
  so choosing the *same* file twice in a row still fires a change event.
- **`FileIcon.jsx`** — One small SVG document icon whose color changes via
  a CSS class (`file-icon-image`, `file-icon-document`, etc.) based on the
  `category` from `getFileKind()`. A single component instead of five
  separate icon files, since the shape is identical and only the color
  needs to change.
- **`FileTable.jsx`** — The actual "Details view" table: Name / From /
  Date Uploaded / Type / Size columns. Clicking a header calls `onSort`
  with that column's key; the active column shows a ▲/▼ arrow. Clicking a
  row selects it (opens the details pane); double-clicking a row calls
  `downloadFile()` directly, mirroring how double-click "opens" a file in
  a real file explorer. The Name column never truncates — long names wrap
  onto a second line (`overflow-wrap: anywhere` in `index.css`) instead of
  being cut off with `...`, so you can always read the full name directly
  in the list without clicking anything. The `title={file.file_name}`
  attribute on that cell is a small bonus on top: hovering it also shows
  the name as your browser's native tooltip.
- **`DetailsPane.jsx`** — Shows the selected file's icon, name, type,
  size, sender device, and full upload date + time (this is the piece
  that directly answers your request for "details when it was uploaded,
  the date, time, and other good details"), plus Download and Delete
  buttons. It's a `<dl>` (description list) rather than a table — the
  semantically correct HTML element for "a list of label/value pairs,"
  which also gets sensible default screen-reader behavior for free. The
  name here is never truncated (it wraps instead, via `word-break:
  break-word`), and a **Copy full name** button next to it calls
  `navigator.clipboard.writeText()` so you can paste the exact filename
  into another app (Notepad, a search box, a chat) when you need to read
  or search for something that got cut off in the table.

### `src/pages/` — one component per route

- **`LoginPage.jsx`** — Email/password form that toggles between "Log In"
  and "Sign Up" mode. Sign-up is included so you can create your one
  account through the app itself if you'd rather not use the Supabase
  dashboard for it — but per the setup steps above, you turn off public
  sign-ups in Supabase afterward, so this form stops accepting new
  accounts once you've made yours.
- **`HomePage.jsx`** — The main screen. Owns the pieces that need to be
  shared between the table and the details pane: which file is selected
  (`selectedId`), the current sort, and drag-state for the drop zone. On
  first visit on a new device it shows the "Which device is this?" prompt
  before anything else, since every uploaded file needs that label. Wires
  the whole-page `onDrop` handler so you can drag a file from your desktop
  anywhere onto the list, and a `Delete` keypress on the container so you
  can remove the selected file without reaching for the mouse.
- **`SettingsPage.jsx`** — Change the device label and log out. Kept
  separate from Home instead of a settings modal so it has its own URL
  (`#/settings`) you can navigate to/from directly.

### `supabase/schema.sql` — the database setup script

Run once in Supabase's SQL editor; safe to re-run any time (every
statement uses `if not exists` / `drop policy if exists` first).

- **`create table messages`** — one row per file: `user_id`, `file_path`,
  `file_name`, `file_size`, `file_type`, `device`, `created_at`.
  `user_id` defaults to `auth.uid()` so you never have to set it yourself
  from the app — the database fills it in from your login session.
- **Row Level Security policies** (`for select` / `insert` / `delete`,
  each `using (auth.uid() = user_id)`) — this is the actual security
  boundary. Even though the browser holds a key anyone could technically
  find in your page's network requests, Postgres itself refuses to return
  or modify a row that isn't yours. This is *why* it's safe to use a
  public anon key in a client-side app at all.
- **`alter publication supabase_realtime add table public.messages`** —
  turns on the live-update stream `useFiles.js` subscribes to. Without
  this line, uploads would only ever show up after a manual refresh.
- **Storage bucket + policies** — creates the private `attachments`
  bucket and three matching policies (read/upload/delete) that check
  `auth.uid()::text = (storage.foldername(name))[1]` — i.e. the first
  folder in the file's path must equal your user ID. This is the storage
  equivalent of the RLS policies above, and is why files are uploaded to
  `<user.id>/<filename>` rather than just `<filename>`.

### `.github/workflows/deploy.yml` — automatic deployment

Runs on every push to `main`: installs dependencies, runs `npm run build`
(injecting your two GitHub secrets as env vars so the built site has your
real Supabase URL/key baked in), then publishes the result to GitHub
Pages. This exists so you never have to manually build and upload files —
push code, and the live site updates itself within a minute or two.

### `vite.config.js` and the PWA setup

- `base: '/Transfer-App/'` — tells Vite every asset URL (JS, CSS, icons)
  needs that folder prefix, because GitHub Pages serves your repo at
  `github.io/<repo-name>/`, not at the domain root.
- The `VitePWA` plugin generates the web app manifest (name, icons, theme
  color, `display: 'standalone'`) and a service worker at build time —
  this is the entire mechanism that makes "Install app" show up in
  Chrome/Edge/Brave and lets the app open in its own window instead of a
  browser tab.
- **`public/pwa-192x192.png`, `public/pwa-512x512.png`** — the placeholder
  app icons (a light "T" on a dark charcoal square) referenced by that
  manifest. Generated
  as raw PNG bytes by a one-off script rather than a design tool, since
  they're meant as a placeholder you can swap out later.

### Ideas for later
- Add columns to sort by, or a search/filter box, for a big file list
- Support pasting an image directly from the clipboard
- Add push notifications when a new message arrives
- Show upload progress for large files

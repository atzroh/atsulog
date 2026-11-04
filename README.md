# Atsulog

<!--toc:start-->

- [Atsulog](#atsulog)
  - [URL](#url)
  - [Tech Stack](#tech-stack)
  - [Getting Started](#getting-started)
  - [Managing Articles](#managing-articles)
  - [Backup & Restore](#backup--restore)
  - [Deployment](#deployment)
  - [Project Structure](#project-structure)
  - [Customization](#customization)

<!--toc:end-->

A minimal personal blog engine built with Next.js (App Router) and Tailwind CSS. Articles are written in Markdown and stored in a local SQLite database.

![share_image](./public/share-image.png)

## URL

https://atsulog.com

## Tech Stack

- Next.js 16+ (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- SQLite via the built-in `node:sqlite` (Node.js 22.19+; no database server required)

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file:

   ```env
   # Required (the app will not start without SESSION_SECRET)
   ADMIN_PASSWORD=your-secure-password
   SESSION_SECRET=your-random-session-secret
   # Optional: Google Analytics loads only when this is set
   NEXT_PUBLIC_GA_ID=your-ga-id
   ```

3. **Run locally**

   ```bash
   npm run dev
   ```

## Managing Articles

- **Web UI**: Log in at `/login` to create and edit articles directly in your browser.
- **Local Data**: Everything lives in the `data/` folder: articles in `data/articles.db`, uploaded images in `data/images.db`, and fetched link cards in `data/link-cards.db` (all created on first use). Unused images can be found and deleted at `/edit/images`. `link-cards.db` is only a cache, so it is not backed up; deleting it makes the cards be fetched again.
- **Math**: Write `$E = mc^2$` for inline math and `$$ ... $$` (or a ` ```math ` block) for a display equation; both are typeset with KaTeX. A literal dollar sign in prose needs escaping as `\$` (inside code spans and fenced blocks it is left alone).
- **Link Cards**: A paragraph that is nothing but an `http(s)` URL is shown as a card with the page's title, description and image.
- **Diagrams**: A ` ```mermaid ` block is drawn as a diagram with Mermaid.

## Backup & Restore

Each database is backed up as a plain-text SQL dump, which diffs well in Git. The `sqlite3` CLI is required.

- **Back up**: `sqlite3 data/articles.db .dump > data/articles.sql` and `sqlite3 data/images.db .dump > data/images.sql` (safe while the app is running)
- **Restore**: `npm run db:restore` rebuilds `data/articles.db` and `data/images.db` from their dumps. Stop the app first. On a standalone deployment, run the same commands from the app directory:

  ```bash
  rm -f data/articles.db data/articles.db-wal data/articles.db-shm
  sqlite3 data/articles.db <data/articles.sql
  rm -f data/images.db data/images.db-wal data/images.db-shm
  sqlite3 data/images.db <data/images.sql
  ```

## Deployment

Run the app behind a reverse proxy that appends the client address to `X-Forwarded-For`. The login lockout counts failures per address, taken from the rightmost entry of that header; without a proxy every visitor shares one count, so a few failed attempts by anyone lock out the admin too.

The app runs as a Next.js standalone server under pm2 in `/home/ubuntu/app`, listening only on `127.0.0.1:3000` behind nginx. The server needs Node.js 22.19+, pm2, nginx (set up as the reverse proxy), sqlite3 and netfilter-persistent. Image uploads can be up to 10MB, so set nginx's `client_max_body_size` to `10m` or more (the default is 1MB).

### Building the bundle

On your machine:

```bash
./standalone.sh
```

This builds the app and packs it into `deploy.tar.gz` (the server, static files and `ecosystem.config.cjs`). `data/` and `.env*` are not included.

### First deployment

1. **Upload the files** with SFTP:

   ```
   sftp ubuntu@<server>
   sftp> mkdir /home/ubuntu/app
   sftp> cd /home/ubuntu/app
   sftp> put deploy.tar.gz
   sftp> put startup.sh
   sftp> put restart.sh
   ```

2. **Extract the bundle** on the server:

   ```bash
   cd /home/ubuntu/app
   tar -xzf deploy.tar.gz
   ```

3. **Get the data.** Clone the articles repository into `data/`. The server needs push access to it for backups.

   ```bash
   git clone git@github.com:atzroh/atsulog-articles.git data
   ```

   Only the SQL dumps are in Git; `startup.sh` rebuilds the `.db` files from them.

4. **Set the environment variables.** Create `.env.production`, which the server reads on start:

   ```bash
   openssl rand -base64 32 # use the output as SESSION_SECRET
   nano .env.production
   chmod 600 .env.production
   ```

   ```env
   SESSION_SECRET=your-random-session-secret
   ADMIN_PASSWORD=your-secure-password
   ```

   Without `SESSION_SECRET`, every page returns 500. `NEXT_PUBLIC_GA_ID` is built into the bundle, so it belongs in your local `.env.local`, not here.

5. **Run the setup script:**

   ```bash
   bash startup.sh
   ```

   It is safe to run again. In order, it:
   - opens ports 80 and 443 in iptables and saves the rules
   - enables and restarts nginx
   - registers pm2 to start on boot
   - restores `data/articles.db` and `data/images.db` from their dumps if the `.db` files do not exist
   - starts the app with `ecosystem.config.cjs` and saves the pm2 process list
   - waits up to 30 seconds for the app to respond

6. **Schedule backups.** Run `data/git_autopush.sh` with cron (`crontab -e`). It dumps the databases and pushes any changes. For example, every hour:

   ```
   0 * * * * /home/ubuntu/app/data/git_autopush.sh >> /home/ubuntu/backup.log 2>&1
   ```

### Later deployments

1. **Build and upload** the new bundle, replacing the old one:

   ```bash
   ./standalone.sh
   ```

   ```
   sftp ubuntu@<server>
   sftp> cd /home/ubuntu/app
   sftp> put deploy.tar.gz
   ```

   Upload `restart.sh` or `startup.sh` too if they changed.

2. **Restart the app** on the server:

   ```bash
   cd /home/ubuntu/app
   bash restart.sh
   ```

   It checks the archive, replaces the app files with its contents, starts the app again and waits up to 30 seconds for it to respond. `data/` and `.env*` are kept.

Notes:

- The site is down for a few seconds while the files are replaced.
- A failed deployment is not rolled back. To be able to roll back, copy the previous `deploy.tar.gz` aside before building (`standalone.sh` deletes it), then upload that copy and run `restart.sh` again.

### Troubleshooting

If the app does not respond or returns 500, check its logs:

```bash
pm2 logs atsulog --lines 50 --nostream
```

For example, `SESSION_SECRET environment variable is not set.` means `.env.production` is missing (see step 4 of the first deployment).

## Project Structure

Logic lives in `app/lib/`, grouped by feature:

```
app/lib/
├── article/         Article queries (SQLite), types and form handling
├── auth/            Session (JWT cookie) and login with lockout
├── db/              Opens articles.db, images.db and link-cards.db
├── editor/          Editor hooks: form state, tag input, leave-page guard
├── feed/            Atom feed
├── home/            Icosphere geometry for the home page
├── image/           Image storage, MIME types and usage tracking
├── link-card/       Fetching, caching and building link cards, with SSRF guard
├── markdown/        Rendering (unified) and editor helpers
├── date-format.ts   Date formatting in the site's time zone
├── page-metadata.ts Shared page metadata (share image, site name)
└── site-config.ts   Site settings (see Customization)
```

## Customization

Update your site details (title, language, etc.) in `app/lib/site-config.ts`.

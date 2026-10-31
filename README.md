# Atsulog

<!--toc:start-->

- [Atsulog](#atsulog)
  - [URL](#url)
  - [Tech Stack](#tech-stack)
  - [Getting Started](#getting-started)
  - [Managing Articles](#managing-articles)
  - [Backup & Restore](#backup-restore)
  - [Migrating from JSON & Markdown Files](#migrating-from-json-markdown-files)
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
- SQLite via the built-in `node:sqlite` (Node.js 22.13+; no database server required)

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file:

   ```env
   ADMIN_PASSWORD=your-secure-password
   SESSION_SECRET=your-random-session-secret
   NEXT_PUBLIC_GA_ID=your-ga-id
   ```

3. **Run locally**

   ```bash
   npm run dev
   ```

## Managing Articles

- **Web UI**: Log in at `/login` to create and edit articles directly in your browser.
- **Local Data**: Everything lives in the `data/` folder: articles in `data/atsulog.db` (created on first use), images in `data/images/`.
- **Math**: Write `$E = mc^2$` for inline math and `$$ ... $$` for a display equation; both are typeset with KaTeX. A literal dollar sign in prose needs escaping as `\$` (inside code spans and fenced blocks it is left alone).

## Backup & Restore

The database is backed up as a plain-text SQL dump, which diffs well in Git. The `sqlite3` CLI is required.

- **Back up**: `sqlite3 data/atsulog.db .dump > data/atsulog.sql` (safe while the app is running)
- **Restore**: `npm run db:restore` rebuilds `data/atsulog.db` from `data/atsulog.sql`. Stop the app first. On a standalone deployment, run the same commands from the app directory:

  ```bash
  rm -f data/atsulog.db data/atsulog.db-wal data/atsulog.db-shm
  sqlite3 data/atsulog.db <data/atsulog.sql
  ```

## Migrating from JSON & Markdown Files

Earlier versions stored articles in `data/articles.json` and `data/articles/*.md`. To move them into the database:

1. Stop the app.
2. Run `node scripts/migrate-to-sqlite.mjs <path-to-data>` (the script has no dependencies, so it can be copied to the server on its own). It prints how many articles it migrated and does nothing if the database already has articles.
3. Deploy and start the new version.

The old files are left in place, so the previous version can still be started as long as no article has been edited since the migration.

## Customization

Update your site details (title, language, etc.) in `app/lib/site-config.ts`.

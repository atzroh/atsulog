# Atsulog

A minimal, file-based personal blog engine built with Next.js (App Router) and Tailwind CSS. Articles are managed as local Markdown files.

![share_image](./public/share-image.png)

## URL
https://atsulog.com

## Tech Stack

- Next.js 16+ (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Local Markdown & JSON (No database required)

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
- **Local Files**: Articles and images are saved locally in the `data/` folder, making it easy to manage with Git.
- **Math**: Write `$E = mc^2$` for inline math and `$$ ... $$` for a display equation; both are typeset with KaTeX. A literal dollar sign in prose needs escaping as `\$` (inside code spans and fenced blocks it is left alone).

## Customization

Update your site details (title, language, etc.) in `app/lib/site-config.ts`.

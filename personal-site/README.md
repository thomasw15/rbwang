# Personal Site

Minimal Next.js (App Router) + Tailwind site with three placeholder visualizations, a lightbox overlay, and stub pages for Bio and Others.

## Run locally

Open a terminal and run:

```
cd personal-site
npm install
npm run dev
```

Then open http://localhost:3000

## Replace placeholders
- Update visualization titles in `src/app/page.tsx` (array `items`).
- Replace card/overlay visuals (currently gradient blocks) with your content.
- Edit copy in `src/app/bio/page.tsx` and projects in `src/app/others/page.tsx`.

## Components
- `Header` – top navigation with active state
- `VizCard` – tall card used on the homepage
- `LightboxOverlay` – full-screen overlay with Esc and arrow key navigation

Aesthetic: dark, minimal theme with subtle grid background and a soft purple accent.



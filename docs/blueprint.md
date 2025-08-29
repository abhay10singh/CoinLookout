## CoinLookout — Project Overview

CoinLookout is a modern, responsive crypto price tracker focused on clarity, speed, and a clean visual experience. It pulls real‑time data for major cryptocurrencies and presents it in a compact, informative table with quick tools for search, sort, filter, and favorites.

### What it does
- Real-time prices with 24h change, including visual up/down indicators (green for gains, red for losses).
- Key stats per coin: market cap, 24h volume, and circulating supply.
- Sorting by name, price, and % change.
- Fast search to jump to a specific coin.
- 7‑day sparkline next to each coin for quick trend scanning.
- Useful filters (e.g., only gainers today, market cap > $1B).
- Favorites list stored locally so I can track selected coins across sessions.
- Light/Dark theme toggle with a slick, minimal look.
- Auto-refresh roughly every 30 seconds to keep data fresh without a page reload.

### Design & UX
- Clean, minimal, slightly futuristic aesthetic.
- Monochromatic base with subtle gradients; accent color Electric Blue (#7DF9FF) for highlights and interactions.
- Subtle glassmorphism/neumorphism on cards for depth without clutter.
- Consistent, modern iconography.

### Tech & Data
- Frontend: Next.js (App Router) + React, styled with Tailwind CSS.
- Data source: CoinGecko (no auth required) for market data.
- Optional: lightweight backend cache can be added later for performance if needed.

### Extras / Nice-to-haves
- Crypto news sidebar pulling recent headlines from a free news API.
- Quick converter to estimate how much BTC/ETH/etc. a given USD amount buys.

### Notes
- Favorites are saved in local storage (no account required).
- Performance focuses on snappy table interactions and quick scans via sparklines.

This document captures the intent and scope of CoinLookout as a polished, everyday crypto dashboard rather than a trading terminal. It’s meant to be a clear snapshot of what the app offers and how it should feel.
  
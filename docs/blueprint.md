# **App Name**: CoinLookout

## Core Features:

- Real-Time Price Display: Display cryptocurrency name, symbol, current price, and 24-hour price change with visual indicators (green up arrow for increase, red down arrow for decrease).
- Detailed Crypto Stats: Show market capitalization, 24-hour trading volume, and circulating supply for each cryptocurrency.
- Crypto Search: Implement a search bar for users to quickly find specific cryptocurrencies.
- Favorites Section: Enable users to bookmark coins they want to track closely, storing the data locally.
- Theme Toggle: Add a toggle for users to switch between dark and light mode.

## Style Guidelines:

- Clean and minimal layout with a futuristic vibe.
- Use a monochromatic color scheme with subtle gradients.
- Accent color: Electric Blue (#7DF9FF) for highlights and interactive elements.
- Use a set of consistent and modern icons for cryptocurrency symbols and interactive elements.
- Incorporate slight glassmorphism or neumorphism effects for card components to create depth and a modern aesthetic.

## Original User Request:
Build a modern and responsive Crypto Price Tracker website that fetches real-time data of all major cryptocurrencies.

Core features:

Display name, symbol, current price, and 24-hour price change (show green up arrow if increased, red down arrow if decreased).

Display market capitalization, 24-hour trading volume, and circulating supply for each coin.

Allow users to sort by price, name, or % change.

Add a search bar to quickly find a specific coin.

Show sparklines (mini line graphs) for last 7-day price trends beside each coin.

Add filters (like: only show coins that increased today, or only coins with market cap above $1B).

Create a "Favorites" section where users can bookmark coins they want to track closely (store in local storage).

Provide a dark mode / light mode toggle.

Bonus features (optional but nice to have):

Show news headlines related to cryptocurrencies in a side widget (fetch from free Crypto News API).

Add a converter where users can quickly calculate how much Bitcoin, Ethereum, etc. they can buy with a given USD amount.

Add live updating every 30 seconds without needing page refresh.

Visual Style:

Clean, minimal, futuristic vibe.

Slight glassmorphism or neumorphism style for card components.

Use TailwindCSS or another utility-first CSS framework for fast, beautiful UI.

Tech Stack suggestion:

Frontend: React.js (or Next.js if SEO is needed)

API: CoinGecko API (free, no auth needed) or CoinMarketCap API (needs API key) or binance (needs API key)

Optional Backend: Node.js + Express if you want to cache or process APIs for better performance.
  
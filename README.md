# FCG Grant Finder

AI-powered funding discovery for small businesses, nonprofits, and community organizations. Searches across federal, state, municipal, and private funding sources to find grants, loans, contracts, and tax credits that match your profile.

Built by [FCG-builds](https://github.com/FCG-builds) (Fairy Circle Garden).

## How It Works

1. **Describe your organization** -- category, location, funding needs, project description
2. **AI researches matching opportunities** -- scans grants, loans, contracts, and tax credits
3. **Get actionable results** -- program names, agencies, amounts, deadlines, eligibility, application tips
4. **Save and track** -- bookmark opportunities to a persistent saved list

## Features

- 10 industry categories (small business, nonprofit, tech, education, healthcare, etc.)
- 4 funding types: grants, low-interest loans, government contracts, tax credits
- 4 government levels: federal, state, municipal, private/foundation
- All 50 US states supported
- Match scoring for each opportunity
- Application tips per program
- Save/bookmark list with localStorage persistence
- Dark theme, zero-dependency UI
- White-label ready -- fork and customize for your clients

## Quick Start

\`\`\`bash
git clone https://github.com/FCG-builds/fcg-grant-finder.git
cd fcg-grant-finder
npm install
npm run dev
\`\`\`

Uses the Anthropic API (Claude) for research. When deployed as a Claude.ai artifact, API access is built in. For standalone deployment, you need an API key.

## Use Cases

- **Grant writers** -- fast research across all funding levels
- **Small business owners** -- discover opportunities you didn't know existed
- **Nonprofit directors** -- find program-specific funding
- **Community organizations** -- municipal and state grants for local projects
- **Consultants** -- offer funding research as a service to clients

## For Your Business

Fork this repo and customize:
- Add industry-specific categories for your clients
- Customize the AI prompt with regional funding sources
- Add your branding
- Deploy as a client-facing tool on your website

## Tech Stack

- React 18 + Vite
- Anthropic Claude API (claude-sonnet-4-20250514)
- Zero backend -- runs entirely in the browser
- localStorage for saved opportunities

## License

MIT

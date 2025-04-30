# AI Fiszki

A web application for generating, reviewing, and managing flashcard decks using AI (GPT‑4o‑mini) and manual tools. AI Fiszki streamlines the creation of high-quality study flashcards, saving users time and effort.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

AI Fiszki enables students and learners to quickly generate, review, and manage educational flashcard sets. It integrates with OpenAI's GPT‑4o‑mini for automatic flashcard generation based on user-provided text, while also supporting manual creation, editing, and review of decks and cards.

## Tech Stack

- **Frontend:**
  - Astro 5 (Static site framework)
  - React 19 (Interactive components)
  - TypeScript 5
  - Tailwind CSS 4
  - Shadcn/ui (UI component library)
- **Backend & Database:**
  - Supabase (PostgreSQL, Auth, SDK)
- **AI Integration:**
  - Openrouter.ai (Access to GPT‑4o‑mini and other models)
- **CI/CD & Hosting:**
  - GitHub Actions
  - DigitalOcean (Docker deployment)

## Getting Started

Follow these steps to run the project locally:

### Prerequisites

- Node.js (>= 22.14.0) — see [.nvmrc](.nvmrc)
- npm or Yarn
- A Supabase project (URL and ANON key)
- Openrouter.ai API key for AI requests

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ai-fiszki.git
   cd ai-fiszki
   ```
2. Switch to the Node version specified:
   ```bash
   nvm use
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
4. Create a `.env` file in the project root with the following variables:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

These scripts are defined in `package.json`:

- `npm run dev` — Start the Astro development server
- `npm run build` — Build the production site
- `npm run preview` — Preview the production build locally
- `npm run astro` — Run the Astro CLI
- `npm run lint` — Run ESLint
- `npm run lint:fix` — Run ESLint with automatic fixes
- `npm run format` — Run Prettier to format code

## Project Scope

**MVP Features:**

- **Authentication & User Profiles**
  - Email registration with 24h verification link (max 3 resend attempts)
  - Email/password login and password reset
  - Profile updating
- **Deck Management**
  - Create, read, update, delete (CRUD) decks
  - Deck fields: `id`, `user_id`, name, description, source URL, card limit, categories
- **Card Management**
  - Manual CRUD of cards (question up to 200 chars, answer up to 500 chars)
- **AI Flashcard Generation**
  - Paste text up to 10,000 characters with counter and block on overflow
  - Numeric field for max number of cards (default 1 per 500 chars)
  - AI request with 20s timeout, abort/retry/backoff with UI progress and retry button
  - Display generated cards with source snippet references
- **Review Process**
  - Accept or reject each card, ability to change status
  - Automatic deletion of rejected cards after review
  - Timestamps for start/end times to calculate time spent
- **Monitoring & Limits**
  - Track OpenAI token usage at user and application level
  - Block AI requests after free token limit
  - SLA measurement (P95 < 20s)
- **Error Handling & Degradation**
  - User-friendly error messages
  - Retry/backoff queue
  - Manual card creation fallback if AI is unavailable

**Out of Scope (MVP):**

- Advanced spaced repetition algorithm
- Import from PDF, DOCX, etc.
- Mobile-specific UI
- Sharing decks between users
- External educational platform integrations

## Project Status

This project is in active development toward its MVP milestones. Features for authentication, deck/card CRUD, and AI generation are being implemented and tested.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details. 
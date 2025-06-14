# REST API Plan

## 1. Resources

- **User** (`auth.users` via Supabase Auth)
- **Deck** (`decks`)
- **Category** (`categories`)
- **DeckCategory** (`deck_categories`)
- **AI Job** (`ai_jobs`)
- **AI Metrics** (`ai_metrics`)
- **Card** (`cards`)
- **Token Usage** (`token_usage`)

## 2. Endpoints

### 2.2 Deck Management

#### GET /api/decks

- Description: List user's decks (paginated).
- Query Parameters: `?page=1&limit=20&sort=created_at:desc`
- Response 200:
  ```json
  { "data": [{ "id": "uuid", "name": "string", ... }], "meta": { "page":1, "total":100 } }
  ```

#### POST /api/decks

- Description: Create a new deck.
- Request Body:
  ```json
  { "name": "string", "description": "string?", "source_url": "string", "card_limit": number?, "category_ids": ["uuid"]? }
  ```
- Response 201: Created deck object.
- Validation: name ≤100 chars, source_url valid URL, card_limit>0.

#### GET /api/decks/:deckId

- Description: Get a single deck.
- Response 200: Deck with categories array.

#### PUT /api/decks/:deckId

- Description: Update deck properties.
- Request Body: same as create.
- Response 200: Updated deck.

#### DELETE /api/decks/:deckId

- Description: Delete a deck and its cards.
- Response 204: No content.

### 2.3 Category Management

#### GET /api/categories

- Description: List all categories.
- Response 200: Array of categories.

#### POST /api/decks/:deckId/categories

- Description: Attach categories to a deck.
- Request Body:
  ```json
  { "category_ids": ["uuid"] }
  ```
- Response 200: Updated deck categories.

#### DELETE /api/decks/:deckId/categories/:categoryId

- Description: Remove category from deck.
- Response 204: No content.

### 2.4 Card Management

#### GET /api/decks/:deckId/cards

- Description: List cards for a deck (paginated, filter by status).
- Query: `?status=pending&page=1&limit=50`
- Response 200: Paginated list.

#### POST /api/decks/:deckId/cards

- Description: Manually add a card.
- Request Body:
  ```json
  { "question": "string", "answer": "string" }
  ```
- Response 201: Created card.
- Validation: question ≤200 chars, answer ≤500 chars.

#### PUT /api/decks/:deckId/cards/:cardId

- Description: Update a card's Q/A.
- Request Body: same fields.
- Response 200: Updated card.

#### DELETE /api/decks/:deckId/cards/:cardId

- Description: Delete a card.
- Response 204.

#### PATCH /api/decks/:deckId/cards/:cardId/status

- Description: Accept or reject a card.
- Request Body:
  ```json
  { "status": "accepted" | "rejected" }
  ```
- Response 200: Updated card with new status and timestamps.

#### GET /api/decks/:deckId/cards/study

- Description: Retrieve all cards ready for study from a deck (accepted status).
- Response 200:
  ```json
  [{ "id": "uuid", "question": "string", "answer": "string" }]
  ```
- Notes: Returns full list of cards without pagination for sequential, full-screen study.

### 2.5 AI Job Management

#### POST /api/decks/:deckId/ai-jobs

- Description: Start AI generation job.
- Request Body:
  ```json
  { "input_text": "string (≤10000)", "requested_card_count": number }
  ```
- Response 202:
  ```json
  { "job_id": "uuid", "status": "pending" }
  ```
- Logic: enqueue job, enforce token quota, abort after 20s.

#### GET /api/decks/:deckId/ai-jobs

- Description: List jobs for a deck (paginated).

#### GET /api/decks/:deckId/ai-jobs/:jobId

- Description: Get job status and results (cards).
- Response 200:
  ```json
  { "id": "uuid", "status": "succeeded", "cards": [ ... ], "tokens_used": number }
  ```

#### POST /api/decks/:deckId/ai-jobs/:jobId/retry

- Description: Retry a failed or timed-out job.
- Response 202: New job status updated.

### 2.6 AI Metrics

#### GET /api/decks/:deckId/ai-jobs/:jobId/metrics

- Description: Retrieve latency and outcome.
- Response 200:
  ```json
  { "latency_ms": number, "outcome": "succeeded" }
  ```

### 2.7 Token Usage

#### GET /api/token-usage

- Description: Get daily token usage for user.
- Query: `?date=YYYY-MM-DD`
- Response 200: Usage record.

## 3. Authentication & Authorization

- Use JWT issued by Supabase Auth.
- All endpoints (except `/api/auth/*`) require Bearer token.
- RLS policies enforce `user_id = auth.uid()` on all user-scoped tables.

## 4. Validation & Business Logic

- **Validation rules:**
  - `input_text` max length 10000.
  - `question` max 200, `answer` max 500.
  - Positive integers for `card_limit`, `requested_card_count`.
  - Valid URL for `source_url`.
- **Business logic mapping:**
  - Email verification, password reset: handled in `/api/auth`.
  - AI job queue with timeout, retry/backoff.
  - Automatic deletion of rejected cards: background cleanup after review session.
  - Token quota checks before job creation.
  - Metrics recording to `ai_metrics` after job completion.

---

_Assumptions:_

- Rate limiting and retry logic implemented via middleware and background workers.
- Categories are global, created via admin or separate endpoint not in MVP.
- Frontend will handle progress bar and UI feedback per PRD.

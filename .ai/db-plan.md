# Database Schema Plan

## 1. Tables

### 1.1. Database Extensions

- Enable UUID generation:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 1.2. Enum Types

Define enums for statuses:

```sql
CREATE TYPE card_status AS ENUM ('pending','accepted','rejected');
CREATE TYPE ai_job_status AS ENUM ('pending','running','succeeded','failed');
```

### 1.3. users (Supabase Auth)

- `id` UUID PRIMARY KEY (Supabase Auth)
- Other profile fields managed by Supabase

### 1.4. decks

| Column      | Type         | Constraints                                     |
| ----------- | ------------ | ----------------------------------------------- |
| id          | UUID         | PK, DEFAULT uuid_generate_v4()                  |
| user_id     | UUID         | NOT NULL, FK → auth.users(id) ON DELETE CASCADE |
| name        | VARCHAR(100) | NOT NULL                                        |
| description | TEXT         |                                                 |
| source_url  | TEXT         | NOT NULL                                        |
| card_limit  | INTEGER      | CHECK (card_limit > 0)                          |
| created_at  | TIMESTAMPTZ  | NOT NULL, DEFAULT now()                         |
| updated_at  | TIMESTAMPTZ  | NOT NULL, DEFAULT now()                         |

### 1.5. categories

| Column     | Type         | Constraints                    |
| ---------- | ------------ | ------------------------------ |
| id         | UUID         | PK, DEFAULT uuid_generate_v4() |
| name       | VARCHAR(100) | NOT NULL, UNIQUE               |
| created_at | TIMESTAMPTZ  | NOT NULL, DEFAULT now()        |
| updated_at | TIMESTAMPTZ  | NOT NULL, DEFAULT now()        |

### 1.6. deck_categories

| Column      | Type | Constraints                                     |
| ----------- | ---- | ----------------------------------------------- |
| deck_id     | UUID | NOT NULL, FK → decks(id) ON DELETE CASCADE      |
| category_id | UUID | NOT NULL, FK → categories(id) ON DELETE CASCADE |
| **PK**      |      | (deck_id, category_id)                          |

### 1.7. ai_jobs

| Column               | Type          | Constraints                                       |
| -------------------- | ------------- | ------------------------------------------------- |
| id                   | UUID          | PK, DEFAULT uuid_generate_v4()                    |
| user_id              | UUID          | NOT NULL, FK → auth.users(id) ON DELETE CASCADE   |
| deck_id              | UUID          | NOT NULL, FK → decks(id) ON DELETE CASCADE        |
| input_text           | TEXT          | NOT NULL, CHECK (char_length(input_text) ≤ 10000) |
| requested_card_count | INTEGER       | NOT NULL, CHECK (requested_card_count > 0)        |
| actual_card_count    | INTEGER       | NOT NULL, DEFAULT 0                               |
| status               | ai_job_status | NOT NULL, DEFAULT 'pending'                       |
| tokens_used          | INTEGER       | NOT NULL, DEFAULT 0                               |
| started_at           | TIMESTAMPTZ   |                                                   |
| finished_at          | TIMESTAMPTZ   |                                                   |
| created_at           | TIMESTAMPTZ   | NOT NULL, DEFAULT now()                           |
| updated_at           | TIMESTAMPTZ   | NOT NULL, DEFAULT now()                           |

### 1.8. ai_metrics

| Column      | Type          | Constraints                            |
| ----------- | ------------- | -------------------------------------- |
| request_id  | UUID          | PK, FK → ai_jobs(id) ON DELETE CASCADE |
| latency_ms  | INTEGER       | NOT NULL                               |
| outcome     | ai_job_status | NOT NULL                               |
| recorded_at | TIMESTAMPTZ   | NOT NULL, DEFAULT now()                |

### 1.9. cards

| Column             | Type         | Constraints                                                         |
| ------------------ | ------------ | ------------------------------------------------------------------- |
| id                 | UUID         | PK, DEFAULT uuid_generate_v4()                                      |
| deck_id            | UUID         | NOT NULL, FK → decks(id) ON DELETE CASCADE                          |
| job_id             | UUID         | NOT NULL, FK → ai_jobs(id) ON DELETE CASCADE                        |
| question           | VARCHAR(200) | NOT NULL                                                            |
| answer             | VARCHAR(500) | NOT NULL                                                            |
| source_fragment    | TEXT         |                                                                     |
| status             | card_status  | NOT NULL, DEFAULT 'pending'                                         |
| review_started_at  | TIMESTAMPTZ  |                                                                     |
| review_finished_at | TIMESTAMPTZ  |                                                                     |
| time_spent         | INTERVAL     | GENERATED ALWAYS AS (review_finished_at - review_started_at) STORED |
| created_at         | TIMESTAMPTZ  | NOT NULL, DEFAULT now()                                             |
| updated_at         | TIMESTAMPTZ  | NOT NULL, DEFAULT now()                                             |

### 1.10. token_usage

| Column      | Type    | Constraints                                     |
| ----------- | ------- | ----------------------------------------------- |
| user_id     | UUID    | NOT NULL, FK → auth.users(id) ON DELETE CASCADE |
| usage_date  | DATE    | NOT NULL                                        |
| tokens_used | INTEGER | NOT NULL, DEFAULT 0, CHECK (tokens_used >= 0)   |
| **PK**      |         | (user_id, usage_date)                           |

## 2. Relationships

- auth.users (1) → decks (N)
- decks (1) → cards (N)
- decks (N) ↔ categories (N) via deck_categories
- ai_jobs (1) → cards (N)
- ai_jobs (1) → ai_metrics (1)
- auth.users (1) → ai_jobs (N)
- auth.users (1) → token_usage (N)

## 3. Indexes

```sql
-- Decks by user
CREATE INDEX idx_decks_user_id ON decks(user_id);

-- Cards by deck and status
CREATE INDEX idx_cards_deck_status ON cards(deck_id, status);
CREATE INDEX idx_cards_pending ON cards(deck_id) WHERE status = 'pending';

-- AI jobs by user and deck
CREATE INDEX idx_ai_jobs_user_id ON ai_jobs(user_id);
CREATE INDEX idx_ai_jobs_deck_id ON ai_jobs(deck_id);

-- Token usage lookup
CREATE INDEX idx_token_usage_user_date ON token_usage(user_id, usage_date);
```

## 4. Row-Level Security (RLS)

Enable RLS and policies to restrict data by owner:

```sql
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;

-- Decks
CREATE POLICY select_decks ON decks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY modify_decks ON decks FOR ALL USING (user_id = auth.uid());

-- Cards
CREATE POLICY select_cards ON cards FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM decks
    WHERE decks.id = cards.deck_id
      AND decks.user_id = auth.uid()
  )
);
CREATE POLICY modify_cards ON cards FOR ALL USING (
  EXISTS (
    SELECT 1 FROM decks
    WHERE decks.id = cards.deck_id
      AND decks.user_id = auth.uid()
  )
);

-- AI Jobs
CREATE POLICY select_ai_jobs ON ai_jobs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY modify_ai_jobs ON ai_jobs FOR ALL USING (user_id = auth.uid());

-- Token Usage
CREATE POLICY select_token_usage ON token_usage FOR SELECT USING (user_id = auth.uid());
CREATE POLICY modify_token_usage ON token_usage FOR UPDATE USING (user_id = auth.uid());
```

## 5. Additional Notes

- All tables use UUID primary keys generated by `uuid_generate_v4()`.
- Timestamps (`created_at`, `updated_at`) default to `now()` and use `timestamptz`.
- Enums ensure data integrity for `status` fields.
- CHECK constraints enforce length and value limits at the database level.
- `time_spent` is a generated column computing review duration.
- Future improvements:
  - Partition `ai_jobs` and `token_usage` by date.
  - Scheduled TTL job to purge records older than 30 days.
  - Add audit log tables if auditing is required.
- Wrap AI job and card inserts in a transaction for consistency.
- The schema is normalized to 3NF, with denormalization unnecessary at current scale.

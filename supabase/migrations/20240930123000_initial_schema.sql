-- Migration: Initial Schema for Fiszki (Flashcards) App
-- Description: Creates the initial database schema including all tables, indexes, and RLS policies
-- Date: 2024-09-30

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Create enum types for statuses
create type card_status as enum ('pending','accepted','rejected');
create type ai_job_status as enum ('pending','running','succeeded','failed');

-- Create the decks table to store flashcard collections
create table decks (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name varchar(100) not null,
    description text,
    source_url text not null,
    card_limit integer check (card_limit > 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create categories for organizing decks by topic
create table categories (
    id uuid primary key default uuid_generate_v4(),
    name varchar(100) not null unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create junction table for many-to-many relationship between decks and categories
create table deck_categories (
    deck_id uuid not null references decks(id) on delete cascade,
    category_id uuid not null references categories(id) on delete cascade,
    primary key (deck_id, category_id)
);

-- Create ai_jobs table to track AI-generated flashcard creation jobs
create table ai_jobs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    deck_id uuid not null references decks(id) on delete cascade,
    input_text text not null check (char_length(input_text) <= 10000),
    requested_card_count integer not null check (requested_card_count > 0),
    actual_card_count integer not null default 0,
    status ai_job_status not null default 'pending',
    tokens_used integer not null default 0,
    started_at timestamptz,
    finished_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create ai_metrics table to track performance metrics of AI jobs
create table ai_metrics (
    request_id uuid primary key references ai_jobs(id) on delete cascade,
    latency_ms integer not null,
    outcome ai_job_status not null,
    recorded_at timestamptz not null default now()
);

-- Create cards table to store the actual flashcards
create table cards (
    id uuid primary key default uuid_generate_v4(),
    deck_id uuid not null references decks(id) on delete cascade,
    job_id uuid references ai_jobs(id) on delete cascade,
    question varchar(200) not null,
    answer varchar(500) not null,
    source_fragment text,
    status card_status not null default 'pending',
    review_started_at timestamptz,
    review_finished_at timestamptz,
    time_spent interval generated always as (review_finished_at - review_started_at) stored,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create token_usage table to track token consumption per user per day
create table token_usage (
    user_id uuid not null references auth.users(id) on delete cascade,
    usage_date date not null,
    tokens_used integer not null default 0 check (tokens_used >= 0),
    primary key (user_id, usage_date)
);

-- Create indexes for performance optimization
-- Decks by user
create index idx_decks_user_id on decks(user_id);

-- Cards by deck and status
create index idx_cards_deck_status on cards(deck_id, status);
create index idx_cards_pending on cards(deck_id) where status = 'pending';

-- AI jobs by user and deck
create index idx_ai_jobs_user_id on ai_jobs(user_id);
create index idx_ai_jobs_deck_id on ai_jobs(deck_id);

-- Token usage lookup
create index idx_token_usage_user_date on token_usage(user_id, usage_date);

-- Enable Row Level Security (RLS) on all tables
alter table decks enable row level security;
alter table cards enable row level security;
alter table ai_jobs enable row level security;
alter table token_usage enable row level security;
alter table categories enable row level security;
alter table deck_categories enable row level security;
alter table ai_metrics enable row level security;

-- RLS Policies for decks table
-- Allow users to select only their own decks
create policy "Users can view their own decks" 
on decks for select 
to authenticated
using (user_id = auth.uid());

-- Allow users to insert/update/delete only their own decks
create policy "Users can modify their own decks" 
on decks for insert 
to authenticated
with check (user_id = auth.uid());

create policy "Users can update their own decks" 
on decks for update 
to authenticated
using (user_id = auth.uid());

create policy "Users can delete their own decks" 
on decks for delete 
to authenticated
using (user_id = auth.uid());

-- RLS Policies for cards table
-- Allow users to select cards that belong to their decks
create policy "Users can view cards in their decks" 
on cards for select 
to authenticated
using (
  exists (
    select 1 from decks
    where decks.id = cards.deck_id
      and decks.user_id = auth.uid()
  )
);

-- Allow users to insert cards into their decks
create policy "Users can insert cards in their decks" 
on cards for insert 
to authenticated
with check (
  exists (
    select 1 from decks
    where decks.id = cards.deck_id
      and decks.user_id = auth.uid()
  )
);

-- Allow users to update cards in their decks
create policy "Users can update cards in their decks" 
on cards for update 
to authenticated
using (
  exists (
    select 1 from decks
    where decks.id = cards.deck_id
      and decks.user_id = auth.uid()
  )
);

-- Allow users to delete cards in their decks
create policy "Users can delete cards in their decks" 
on cards for delete 
to authenticated
using (
  exists (
    select 1 from decks
    where decks.id = cards.deck_id
      and decks.user_id = auth.uid()
  )
);

-- RLS Policies for ai_jobs table
-- Allow users to select only their own AI jobs
create policy "Users can view their own AI jobs" 
on ai_jobs for select 
to authenticated
using (user_id = auth.uid());

-- Allow users to insert AI jobs for their decks
create policy "Users can create AI jobs" 
on ai_jobs for insert 
to authenticated
with check (user_id = auth.uid());

-- Allow users to update their own AI jobs
create policy "Users can update their own AI jobs" 
on ai_jobs for update 
to authenticated
using (user_id = auth.uid());

-- Allow users to delete their own AI jobs
create policy "Users can delete their own AI jobs" 
on ai_jobs for delete 
to authenticated
using (user_id = auth.uid());

-- RLS Policies for token_usage table
-- Allow users to select only their own token usage
create policy "Users can view their own token usage" 
on token_usage for select 
to authenticated
using (user_id = auth.uid());

-- Allow users to update only their own token usage
create policy "Users can update their own token usage" 
on token_usage for update 
to authenticated
using (user_id = auth.uid());

-- Allow users to insert only their own token usage
create policy "Users can insert their own token usage" 
on token_usage for insert 
to authenticated
with check (user_id = auth.uid());

-- RLS Policies for categories table (public read)
-- Categories are readable by all authenticated users
create policy "Categories are readable by authenticated users" 
on categories for select 
to authenticated
using (true);

-- Only admins should modify categories (implementation would need admin role definition)
-- For now, we'll restrict modifications to all users

-- RLS Policies for deck_categories junction table
-- Allow users to view deck_categories for their decks
create policy "Users can view deck_categories for their decks" 
on deck_categories for select 
to authenticated
using (
  exists (
    select 1 from decks
    where decks.id = deck_categories.deck_id
      and decks.user_id = auth.uid()
  )
);

-- Allow users to insert deck_categories for their decks
create policy "Users can add categories to their decks" 
on deck_categories for insert 
to authenticated
with check (
  exists (
    select 1 from decks
    where decks.id = deck_categories.deck_id
      and decks.user_id = auth.uid()
  )
);

-- Allow users to delete deck_categories for their decks
create policy "Users can remove categories from their decks" 
on deck_categories for delete 
to authenticated
using (
  exists (
    select 1 from decks
    where decks.id = deck_categories.deck_id
      and decks.user_id = auth.uid()
  )
);

-- RLS Policies for ai_metrics table
-- Allow users to view ai_metrics for their jobs
create policy "Users can view metrics for their AI jobs" 
on ai_metrics for select 
to authenticated
using (
  exists (
    select 1 from ai_jobs
    where ai_jobs.id = ai_metrics.request_id
      and ai_jobs.user_id = auth.uid()
  )
);

-- Anonymous access policies
-- Allow anonymous users to see public categories
create policy "Anonymous users can view categories" 
on categories for select 
to anon
using (true);

-- Trigger function to update updated_at timestamp
create or replace function update_modified_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at timestamp on tables
create trigger set_timestamp_decks
before update on decks
for each row
execute procedure update_modified_column();

create trigger set_timestamp_categories
before update on categories
for each row
execute procedure update_modified_column();

create trigger set_timestamp_ai_jobs
before update on ai_jobs
for each row
execute procedure update_modified_column();

create trigger set_timestamp_cards
before update on cards
for each row
execute procedure update_modified_column();

-- Create function to increment actual_card_count when new cards are inserted
create or replace function increment_actual_card_count()
returns trigger as $$
begin
    update ai_jobs
    set actual_card_count = actual_card_count + 1
    where id = new.job_id;
    return new;
end;
$$ language plpgsql;

-- Create trigger to update actual_card_count
create trigger increment_card_count_after_insert
after insert on cards
for each row
execute procedure increment_actual_card_count(); 
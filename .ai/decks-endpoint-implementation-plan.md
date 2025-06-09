# API Endpoint Implementation Plan: /api/decks

## 1. Przegląd punktu końcowego
Endpoint `/api/decks` realizuje dwie operacje:

- **GET**: pobiera listę talii użytkownika z paginacją i sortowaniem.
- **POST**: tworzy nową talię dla zalogowanego użytkownika, wraz z opcjonalnym przypisaniem kategorii.

Celem jest zapewnienie spójnej obsługi obu metod, zgodnie z REST, z walidacją, obsługą błędów i autoryzacją.

## 2. Szczegóły żądania

### 2.1 GET /api/decks
- Metoda HTTP: GET
- URL: `/api/decks`  
- Nagłówek:  `Authorization: Bearer <token>`
- Query Parameters:
  - `page` (liczba, opcjonalne, domyślnie 1)
  - `limit` (liczba, opcjonalne, domyślnie 20, max 100)
  - `sort` (string, opcjonalne, format `pole:porządek`, np. `created_at:desc`, domyślnie `created_at:desc`)
- Request Body: brak

### 2.2 POST /api/decks
- Metoda HTTP: POST
- URL: `/api/decks`  
- Nagłówek:  `Authorization: Bearer <token>`
- Request Body (JSON): zgodnie z typem `DeckCreateCommand`
  ```json
  {
    "name": "string (≤100 znaków)",
    "description": "string?",
    "source_url": "string (URL)",
    "card_limit": number?,
    "category_ids": ["uuid"]?
  }
  ```

### 2.3 GET /api/decks/:deckId
- Metoda HTTP: GET
- URL: `/api/decks/:deckId`
- Nagłówek:  `Authorization: Bearer <token>`
- Request Body: brak

### 2.4 DELETE /api/decks/:deckId
- Metoda HTTP: DELETE
- URL: `/api/decks/:deckId`
- Nagłówek:  `Authorization: Bearer <token>`
- Request Body: brak

## 3. Wykorzystywane typy
- `DeckSummaryDto` (podstawowe pola talii)
- `DeckDto` (pełna talia z tablicą `categories`)
- `DeckCreateCommand` (polecenie tworzenia talii)
- `PaginatedDto<DeckSummaryDto>` i `PaginationMetaDto`

## 4. Szczegóły odpowiedzi

### 4.1 GET /api/decks
- Status: `200 OK`
- Body:
  ```json
  {
    "data": [ /* DeckSummaryDto[] */ ],
    "meta": { "page": number, "total": number }
  }
  ```

### 4.2 POST /api/decks
- Status: `201 Created`
- Body: obiekt `DeckDto` (nowo utworzona talia z kategoriami)

### 4.3 GET /api/decks/:deckId
- Status: `200 OK`
- Body: obiekt `DeckDto`

### 4.4 DELETE /api/decks/:deckId
- Status: `204 No Content`

## 5. Przepływ danych

1. **Autoryzacja**: Astro popularyzuje `locals.supabase` z tokenem użytkownika.
2. **Walidacja**:
   - GET: parsowanie `page`, `limit`, `sort` przez Zod (`DeckListQuerySchema`).
   - POST: weryfikacja ciała żądania przez `DeckCreateCommandSchema`.
3. **Logika biznesowa** w `DeckService`:
   - `listDecks(query, userId)`:
     - Oblicza offset: `(page - 1) * limit`
     - Wykonuje zapytanie `.from('decks').select(...).range()` oraz `.range()` z `.count()` dla `total`
     - Mapuje wynik na `DeckSummaryDto[]`
   - `createDeck(command, userId)` (istniejąca implementacja)
   - `getDeck(deckId, userId)` – pobranie pojedynczej talii wraz z kategoriami.
   - `deleteDeck(deckId, userId)` – usunięcie talii i skaskadowanie usunięcia kart oraz powiązań.
4. **Odpowiedź**: zwrócenie JSON z nagłówkiem `Content-Type: application/json`.

## 6. Względy bezpieczeństwa

- Wymagane Bearer JWT z Supabase Auth.
- RLS w PostgreSQL gwarantuje, że użytkownik widzi tylko swoje dane.
- Zod uniemożliwia wstrzyknięcie niepoprawnych danych.
- Audyt logów błędów (konsola / Sentry) dla nieoczekiwanych wyjątków.

## 7. Obsługa błędów

- `400 Bad Request`: niepoprawne parametry lub ciało żądania (Zod.errors).
- `401 Unauthorized`: brak/nieprawidłowy token (zwracany przez middleware lub supabase client).
- `500 Internal Server Error`: błędy serwera lub DB.

## 8. Rozważania dotyczące wydajności

- Ograniczenie `limit` (max 100) zabezpiecza przed zwracaniem zbyt dużych zestawów.
- Indeksy na `decks(user_id)` i `created_at` obsługują paginację i sortowanie.
- Możliwość wprowadzenia cachowania warstwy API lub edge caching.

## 9. Kroki implementacji

1. W `src/lib/validation` utworzyć `deck-list.schema.ts` z Zod dla parametrów GET.
2. W `DeckService` dodać metodę `async listDecks(query: DeckListQuery, userId: string): Promise<PaginatedDto<DeckSummaryDto>>`.
3. Zaktualizować `src/pages/api/decks.ts`:
   - Dodać eksport `GET: APIRoute`.
   - Parsować i walidować query z `DeckListQuerySchema`.
   - Wywołać `deckService.listDecks(...)`, zwrócić JSON.
4. Dodać testy jednostkowe dla:
   - Schematów Zod (GET i POST).
   - `DeckService.listDecks` (mock Supabase).
   - Handlerów API (integracja).
5. Zaktualizować dokumentację (OpenAPI / API Plan) i README.
6. Przegląd kodu i code review wg wytycznych clean code.
7. Wdrożenie i testy end-to-end.
8. Utworzyć Zod schemat `DeckIdParamSchema` w `src/lib/validation` (np. `deck-id.schema.ts`) do walidacji parametru `deckId`.
9. W `DeckService` dodać metody:
   - `async getDeck(deckId: string, userId: string): Promise<DeckDto>`
   - `async deleteDeck(deckId: string, userId: string): Promise<void>`
10. Utworzyć plik `src/pages/api/decks/[deckId].ts` z eksportami:
    - `GET`: walidacja `deckId`, autoryzacja, `deckService.getDeck`, zwrócenie `DeckDto`.
    - `DELETE`: walidacja, autoryzacja, `deckService.deleteDeck`, zwrócenie `204 No Content`.
11. Dodać testy jednostkowe i integracyjne dla nowych metod i endpointów.
12. Zaktualizować dokumentację (OpenAPI / API Plan) – dodać GET i DELETE /api/decks/:deckId.
13. Przegląd kodu i merge. 
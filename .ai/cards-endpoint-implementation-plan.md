# API Endpoint Implementation Plan: Cards Endpoints (/api/decks/:deckId/cards*)

## 1. Przegląd punktu końcowego
Zarządzanie kartami w ramach wskazanego decka:
- Pobieranie listy kart (GET)
- Dodawanie karty (POST)
- Aktualizacja karty (PUT)
- Usuwanie karty (DELETE)
- Zmiana statusu karty (PATCH)

## 2. Szczegóły żądania

### GET /api/decks/:deckId/cards
- Metoda HTTP: GET
- URL: `/api/decks/:deckId/cards`
- Path parametry:
  - `deckId` (UUID, wymagane)
- Query parametry (opcjonalne):
  - `status`: enum(`pending`, `accepted`, `rejected`)
  - `page`: integer (domyślnie 1)
  - `limit`: integer (domyślnie 50)

### POST /api/decks/:deckId/cards
- Metoda HTTP: POST
- URL: `/api/decks/:deckId/cards`
- Path parametry:
  - `deckId` (UUID, wymagane)
- Body (JSON):
  ```json
  {
    "question": "string (max 200 chars)",
    "answer": "string (max 500 chars)"
  }
  ```

### PUT /api/decks/:deckId/cards/:cardId
- Metoda HTTP: PUT
- URL: `/api/decks/:deckId/cards/:cardId`
- Path parametry:
  - `deckId` (UUID, wymagane)
  - `cardId` (UUID, wymagane)
- Body (JSON):
  ```json
  {
    "question": "string (max 200 chars)",
    "answer": "string (max 500 chars)"
  }
  ```

### DELETE /api/decks/:deckId/cards/:cardId
- Metoda HTTP: DELETE
- URL: `/api/decks/:deckId/cards/:cardId`
- Path parametry:
  - `deckId` (UUID, wymagane)
  - `cardId` (UUID, wymagane)

### PATCH /api/decks/:deckId/cards/:cardId/status
- Metoda HTTP: PATCH
- URL: `/api/decks/:deckId/cards/:cardId/status`
- Path parametry:
  - `deckId` (UUID, wymagane)
  - `cardId` (UUID, wymagane)
- Body (JSON):
  ```json
  {
    "status": "accepted" | "rejected"
  }
  ```

## 3. Wykorzystywane typy
- `CardDto`
- `PaginatedDto<CardDto>` & `PaginationMetaDto`
- `CardCreateCommand`
- `CardUpdateCommand`
- `CardStatusUpdateCommand`

## 4. Szczegóły odpowiedzi
- GET 200:
  ```json
  {
    "data": CardDto[],
    "meta": { "page": number, "total": number }
  }
  ```
- POST 201: zwraca utworzoną `CardDto`
- PUT 200: zwraca zaktualizowaną `CardDto`
- DELETE 204: No Content
- PATCH 200: zwraca `CardDto` z nowym `status` i timestamps

## 5. Przepływ danych
1. Parsowanie i walidacja path params (deckId, cardId)
2. Walidacja body przy użyciu Zod schema
3. Inicjalizacja `locals.supabase` i `CardService`
4. Wywołanie odpowiedniej metody w `CardService`:
   - `getCards(deckId, filters, page, limit)`
   - `createCard(deckId, command)`
   - `updateCard(deckId, cardId, command)`
   - `deleteCard(deckId, cardId)`
   - `updateCardStatus(deckId, cardId, command)`
5. Mapowanie wyników na DTO
6. Zwrócenie odpowiedzi z odpowiednim kodem statusu

## 6. Względy bezpieczeństwa
- Uwierzytelnianie: Bearer JWT przez Supabase Auth (`locals.supabase`)
- Autoryzacja: RLS w bazie danych gwarantuje dostęp tylko do zasobów użytkownika
- Sanitacja: brak ręcznego tworzenia zapytań SQL, Zod waliduje input

## 7. Obsługa błędów
- 400: brak/nieprawidłowe parametry ścieżki lub body (Zod)
- 401: brak/nieprawidłowy token uwierzytelniający
- 404: deck lub card nie istnieje lub nie należy do zalogowanego użytkownika
- 500: nieoczekiwane błędy serwera (DB, runtime)
- Logowanie: `console.error`, opcjonalnie centralny logger/tabela `error_logs`

## 8. Rozważania dotyczące wydajności
- Użycie paginacji (limit, offset)
- Indeksy DB na `(deck_id, status)`
- Ograniczenie domyślne `limit=50` by uniknąć dużych payloadów
- Unikanie N+1 poprzez wybieranie tylko potrzebnych kolumn

## 9. Kroki wdrożenia
1. Utworzyć Zod schemas w `src/lib/schemas/card.schema.ts`
2. Stworzyć `CardService` w `src/lib/services/card.service.ts` z CRUD + status update
3. Dodać nowe pliki tras:
   - `src/pages/api/decks/[deckId]/cards/index.ts` (GET, POST)
   - `src/pages/api/decks/[deckId]/cards/[cardId].ts` (PUT, DELETE, PATCH)
4. Implementować handlers zgodnie ze specyfikacją, wykorzystać schematy i serwis
5. Napisać testy jednostkowe i integracyjne dla serwisu oraz endpointów
6. Zaktualizować dokumentację API (OpenAPI/Swagger)
7. Code review i testy end-to-end
8. Deployment i monitorowanie logów błędów oraz metryk response time 
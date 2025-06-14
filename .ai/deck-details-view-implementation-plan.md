# Plan implementacji widoku Szczegóły Decka

## 1. Przegląd

Widok Szczegóły Decka pozwala użytkownikowi przeglądać i zarządzać deckiem oraz jego kartami. Użytkownik może edytować i usuwać deck, przeglądać listę kart (zarówno ręcznie dodanych, jak i wygenerowanych przez AI), a także generować nowe fiszki za pomocą AI, akceptować lub odrzucać karty oraz wykonywać akcje masowe.

## 2. Routing widoku

Ścieżka: `/decks/:deckId`
Plik: `src/pages/decks/[deckId].astro` (kontejner React)

## 3. Struktura komponentów

- DeckDetailsPage
  - DeckHeader
    - EditDeckModal
    - DeleteDeckConfirmation
  - CardGenerationPanel
    - TextAreaWithCounter
    - NumberInput
    - ButtonGenerateAI
    - AiJobResultList
  - CardList
    - BulkActions
    - CardItem
      - EditCardModal
      - DeleteCardConfirmation

## 4. Szczegóły komponentów

### DeckHeader

- Opis: Wyświetla nazwę, opis, źródło, limit kart i kategorie decku oraz przyciski edycji i usuwania.
- Główne elementy: nagłówki, przyciski `Edit` i `Delete`.
- Obsługiwane zdarzenia:
  - `onEditClick()` otwiera `EditDeckModal`
  - `onDeleteClick()` otwiera `DeleteDeckConfirmation`
- Typy:
  - `deck: DeckDto`
- Propsy:
  - `deck: DeckDto`
  - `onEdit(): void`
  - `onDelete(): void`

### EditDeckModal

- Opis: Modal z formularzem edycji decku.
- Główne elementy:
  - `Input` dla nazwy (max 100)
  - `Textarea` dla opisu
  - `Input` dla źródła (URL)
  - `NumberInput` dla limitu kart
  - `Select` dla kategorii
  - Przyciski `Save` / `Cancel`
- Obsługiwane zdarzenia:
  - `onSubmit(data: EditDeckViewModel)`
  - `onCancel()`
- Walidacja:
  - `name` wymagane, max 100
  - `source` opcjonalny, walidacja URL
  - `card_limit` opcjonalny, >0
- Typy:
  - `EditDeckViewModel`
- Propsy:
  - `initialData: EditDeckViewModel`
  - `isOpen: boolean`
  - `onClose(): void`
  - `onSave(data: EditDeckViewModel): void`

### DeleteDeckConfirmation

- Opis: Modal potwierdzający usunięcie decku.
- Główne elementy:
  - Tekst ostrzegawczy
  - Przyciski `Confirm` / `Cancel`
- Obsługiwane zdarzenia:
  - `onConfirm()`
  - `onCancel()`
- Propsy:
  - `isOpen: boolean`
  - `onConfirm(): void`
  - `onCancel(): void`

### CardGenerationPanel

- Opis: Panel do generowania fiszek AI.
- Główne elementy:
  - `TextAreaWithCounter` (limit 10 000 znaków)
  - `NumberInput` (liczba kart)
  - `ButtonGenerateAI`
  - Komponent listy wyników: `AiJobResultList`
- Obsługiwane zdarzenia:
  - `onGenerate(input: string, count: number)`
  - `onRetry(jobId: string)`
- Walidacja:
  - `input` ≤ 10 000 znaków
  - `count` > 0, integer
- Typy:
  - `AiJobCreateCommand`
  - `AiJobDto`
- Propsy:
  - `deckId: string`

### CardList

- Opis: Lista wszystkich kart w decku z paginacją nieskończoną.
- Główne elementy:
  - Lista `CardItem`
  - `BulkActions`
  - Loader i komunikat o braku kart
- Obsługiwane zdarzenia:
  - `onLoadMore()`
  - `onBulkAction(type: BulkActionType, selectedIds: string[])`
- Typy:
  - `CardDto`
- Propsy:
  - `deckId: string`

### CardItem

- Opis: Pojedyncza karta z pytaniem, odpowiedzią, statusem i akcjami.
- Główne elementy:
  - Tekst pytania i odpowiedzi
  - Przyciski `Accept`, `Reject`, `Edit`, `Delete`
- Obsługiwane zdarzenia:
  - `onEdit(card: CardDto)`
  - `onDelete(cardId: string)`
  - `onStatusChange(cardId: string, status: CardStatus)`
- Typy:
  - `CardDto`
- Propsy:
  - `card: CardDto`

### ModalCardForm

- Opis: Modal do dodawania/edycji karty.
- Główne elementy:
  - `TextField` dla pytania (max 200)
  - `TextArea` dla odpowiedzi (max 500)
  - Przyciski `Save` / `Cancel`
- Obsługiwane zdarzenia:
  - `onSubmit(data: CardCreateCommand)`
  - `onCancel()`
- Walidacja:
  - `question` wymagane, max 200
  - `answer` wymagane, max 500
- Typy:
  - `CardCreateCommand`
- Propsy:
  - `initialData?: CardDto`
  - `isOpen: boolean`
  - `onClose(): void`
  - `onSave(data: CardCreateCommand): void`

### BulkActions

- Opis: Pasek akcji masowych (accept, reject, delete).
- Główne elementy:
  - Przyciski akcji aktywowane po zaznaczeniu kart
- Obsługiwane zdarzenia:
  - `onAction(type: BulkActionType, selectedIds: string[])`
- Typy:
  - `BulkActionType = 'accept' | 'reject' | 'delete'`
- Propsy:
  - `selectedIds: string[]`

## 5. Typy

- `EditDeckViewModel`: `{ name: string; description?: string; source?: string; card_limit?: number; category_ids?: string[] }`
- `DeckDto`, `CardDto`, `CardCreateCommand`, `CardUpdateCommand`, `AiJobCreateCommand`, `AiJobDto` z `src/types.ts`
- `BulkActionType`, `CardStatus` (Enums<'card_status'>)

## 6. Zarządzanie stanem

- React Query:
  - `useDeckQuery(deckId)`
  - `useUpdateDeckMutation()`
  - `useDeleteDeckMutation()`
  - `useInfiniteCardsQuery(deckId)`
  - `useCreateCardMutation()`, `useUpdateCardMutation()`, `useDeleteCardMutation()`, `useUpdateCardStatusMutation()`
  - `useAiGenerateMutation()`, `useAiJobStatusPolling()`
- `useDisclosure` (shadcn/ui) do zarządzania modalami
- `useToast` do komunikatów

## 7. Integracja API

- `GET /api/decks/:deckId` → `DeckDto`
- `PUT /api/decks/:deckId` body: `EditDeckViewModel` → `DeckDto`
- `DELETE /api/decks/:deckId` → 204 → redirect
- `GET /api/decks/:deckId/cards?cursor=...` → `PaginatedDto<CardDto>`
- `POST /api/decks/:deckId/cards` body: `CardCreateCommand` → `CardDto`
- `PUT /api/decks/:deckId/cards/:cardId` body: `CardUpdateCommand` → `CardDto`
- `DELETE /api/decks/:deckId/cards/:cardId` → 204
- `PATCH /api/decks/:deckId/cards/:cardId/status` body: `{ status: CardStatus }` → `CardDto`
- `POST /api/decks/:deckId/ai-jobs` body: `AiJobCreateCommand` → `AiJobCreateResponseDto`
- `GET /api/ai-jobs/:jobId` → `AiJobDetailDto`

## 8. Interakcje użytkownika

- Otwieranie i zatwierdzanie edycji decku
- Potwierdzanie usunięcia decku
- Wprowadzanie tekstu do AI → licznik znaków, blokada
- Ustawianie liczby kart
- Inicjacja generacji AI → spinner/pasek → retry
- Akceptacja/odrzucenie kart AI w podglądzie
- Zaznaczanie kart → `BulkActions`
- Edycja/Usunięcie pojedynczej karty

## 9. Warunki i walidacja

- `name` decku: wymagane, max 100
- `source`: opcjonalny, URL
- `card_limit`: opcjonalny, >0 integer
- Kategorie: `category_ids` istniejące
- `question`: wymagane, max 200
- `answer`: wymagane, max 500
- AI input: ≤ 10 000

## 10. Obsługa błędów

- Toasty na błędy sieci, rollback optymistyczny
- Walidacja formularzy inline
- 404 deck → redirect z komunikatem
- Timeout AI → retry z komunikatem
- Błędy paginacji → retry

## 11. Kroki implementacji

1. Dodaj endpoint PUT `/api/decks/:deckId` w `[deckId].ts` (`deckService.updateDeck`).
2. Utwórz stronę `src/pages/decks/[deckId].astro` jako kontener React.
3. Implementuj hooki React Query (`useDeckQuery`, `useUpdateDeckMutation`, `useDeleteDeckMutation`).
4. Dodaj komponent `DeckHeader` z modalami edycji i usuwania.
5. Utwórz `EditDeckModal` i `DeleteDeckConfirmation`.
6. Zaimplementuj `CardGenerationPanel` z `TextAreaWithCounter`, `NumberInput`, `ButtonGenerateAI` i pollingiem AI.
7. Stwórz `CardList` z `useInfiniteQuery` i `CardItem`.
8. Dodaj `ModalCardForm` do dodawania/edycji kart.
9. Dodaj `BulkActions` do masowych operacji.
10. Dodaj obsługę błędów i toasty.
11. Przetestuj widok ręcznie i e2e.

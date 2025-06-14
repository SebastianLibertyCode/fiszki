# Plan implementacji widoku Dashboard – Lista Decków

## 1. Przegląd

Widok "Dashboard – Lista Decków" umożliwia użytkownikowi przeglądanie, filtrowanie oraz tworzenie nowych zestawów fiszek (decków). Głównym celem jest zapewnienie szybkiego dostępu do wszystkich decków użytkownika, prezentacja kluczowych informacji oraz wygodna nawigacja do szczegółów decku.

## 2. Routing widoku

- Ścieżka: `/decks`
- Widok dostępny po zalogowaniu.

## 3. Struktura komponentów

- `Sidebar` – panel boczny z filtrami i kategoriami
- `DeckList` – lista decków (obsługuje skeleton loading, stub pustej listy)
- `DeckCard` – pojedyncza karta decku
- `InfiniteScroll` – komponent do ładowania kolejnych stron
- `DeckCreateModal` – modal z formularzem tworzenia decku

Hierarchia:

```
Page: DecksDashboard
├── Sidebar
│   └── CategoryFilter
├── MainContent
│   ├── DeckList
│   │   ├── DeckCard (xN)
│   │   └── EmptyStub / SkeletonLoader
│   └── InfiniteScroll
└── DeckCreateModal
```

## 4. Szczegóły komponentów

### Sidebar

- **Opis:** Panel boczny z filtrami (kategorie, reset filtrów).
- **Główne elementy:** Lista kategorii (checkboxy lub tagi), przycisk reset.
- **Obsługiwane interakcje:** Wybór kategorii, reset filtrów.
- **Walidacja:** Brak (opcjonalnie: sprawdzenie istnienia kategorii).
- **Typy:** `CategoryDto[]`, `string[]` (wybrane kategorie).
- **Propsy:**
  - `categories: CategoryDto[]`
  - `selectedCategories: string[]`
  - `onChange: (ids: string[]) => void`
  - `onReset: () => void`

### DeckList

- **Opis:** Wyświetla listę decków, obsługuje loading i pustą listę.
- **Główne elementy:** Lista `DeckCard`, skeleton loader, stub pustej listy.
- **Obsługiwane interakcje:** Scrollowanie, kliknięcie decku.
- **Walidacja:** Brak (walidacja po stronie API).
- **Typy:** `DeckSummaryDto[]`, `boolean` (loading), `string | null` (error).
- **Propsy:**
  - `decks: DeckSummaryDto[]`
  - `loading: boolean`
  - `error?: string`
  - `onDeckClick: (id: string) => void`

### DeckCard

- **Opis:** Prezentuje pojedynczy deck (nazwa, data, źródło, liczba kart).
- **Główne elementy:** Nazwa, data utworzenia, źródło (link), liczba kart.
- **Obsługiwane interakcje:** Kliknięcie (przejście do widoku decku).
- **Walidacja:** Brak.
- **Typy:** `DeckSummaryDto`.
- **Propsy:**
  - `deck: DeckSummaryDto`
  - `onClick: (id: string) => void`

### InfiniteScroll

- **Opis:** Obsługuje ładowanie kolejnych stron przy scrollu.
- **Główne elementy:** Obserwator scrolla, loader.
- **Obsługiwane interakcje:** Scroll do końca listy.
- **Walidacja:** Brak.
- **Typy:** `boolean` (loading), `boolean` (hasMore).
- **Propsy:**
  - `loading: boolean`
  - `hasMore: boolean`
  - `onLoadMore: () => void`

### DeckCreateModal

- **Opis:** Modal z formularzem tworzenia decku.
- **Główne elementy:** Pola: nazwa, opis, źródło, limit kart, kategorie; przyciski submit/cancel.
- **Obsługiwane interakcje:** Wpisywanie danych, submit, zamknięcie modala.
- **Walidacja:**
  - Nazwa: wymagane, max 100 znaków
  - Źródło: wymagane, poprawny URL
  - Limit kart: opcjonalny, liczba > 0
  - Kategorie: opcjonalne
- **Typy:** `DeckCreateCommand`, `CategoryDto[]`, `FormErrors`.
- **Propsy:**
  - `categories: CategoryDto[]`
  - `onSubmit: (data: DeckCreateCommand) => Promise<void>`
  - `onClose: () => void`
  - `loading: boolean`
  - `error?: string`

## 5. Typy

- `DeckSummaryDto`: { id, name, description, source_url, card_limit, created_at, updated_at }
- `PaginatedDto<DeckSummaryDto>`: { data: DeckSummaryDto[], meta: { page, total } }
- `CategoryDto`: { id, name }
- `DeckCreateCommand`: { name, description?, source_url, card_limit?, category_ids? }
- `DeckListViewModel`: { decks: DeckSummaryDto[], loading: boolean, error: string | null, page: number, hasMore: boolean, filters: { categories: string[] } }
- `DeckFormState`: { name: string, description?: string, source_url: string, card_limit?: number, category_ids?: string[], errors: FormErrors }
- `FormErrors`: { [field: string]: string }

## 6. Zarządzanie stanem

- Globalny stan widoku zarządzany w komponencie strony (`DecksDashboard`).
- Hooki customowe:
  - `useDecksList` – fetchuje decki, obsługuje paginację, loading, error, filtry.
  - `useCategories` – pobiera kategorie do sidebaru.
  - `useInfiniteScroll` – obsługuje scroll i ładowanie kolejnych stron.
  - `useDeckCreateForm` – obsługuje stan formularza, walidację, submit.
- Stan lokalny: loading, error, decks, page, hasMore, filters, modal open/close.

## 7. Integracja API

- **GET /api/decks** – pobranie listy decków (parametry: page, limit, sort, kategorie).
  - Odpowiedź: `PaginatedDto<DeckSummaryDto>`
- **POST /api/decks** – utworzenie nowego decku.
  - Body: `DeckCreateCommand`
  - Odpowiedź: `DeckSummaryDto`
- **GET /api/categories** – pobranie kategorii (jeśli endpoint istnieje).

## 8. Interakcje użytkownika

- Scrollowanie listy → ładowanie kolejnych decków (infinite scroll).
- Kliknięcie decku → przejście do widoku decku.
- Wybór kategorii/filtrów → odświeżenie listy decków.
- Kliknięcie "Utwórz deck" → otwarcie modala, submit → POST, zamknięcie modala po sukcesie.
- Pusta lista → wyświetlenie stubu.
- Błąd ładowania → komunikat błędu, opcja retry.

## 9. Warunki i walidacja

- Nazwa: wymagane, max 100 znaków.
- Źródło: wymagane, poprawny URL.
- Limit kart: opcjonalny, liczba > 0.
- Kategorie: opcjonalne, lista uuid.
- Walidacja po stronie klienta (inline) i serwera (API).
- Komunikaty błędów wyświetlane przy polach i globalnie.

## 10. Obsługa błędów

- Błąd sieci/API → komunikat, opcja ponów.
- Niepoprawne dane w formularzu → walidacja inline, blokada submit.
- Pusta lista decków → stub z informacją.
- Brak kategorii → ukrycie filtrów lub informacja.
- Brak kolejnych stron → wyłączenie infinite scroll.

## 11. Kroki implementacji

1. Stwórz strukturę folderów i plików dla widoku `/decks` oraz komponentów (`Sidebar`, `DeckList`, `DeckCard`, `InfiniteScroll`, `DeckCreateModal`).
2. Zaimplementuj typy i interfejsy DTO/ViewModel w `types.ts` lub lokalnie.
3. Zaimplementuj hooki: `useDecksList`, `useCategories`, `useInfiniteScroll`, `useDeckCreateForm`.
4. Zaimplementuj komponent `Sidebar` z obsługą filtrów i kategorii.
5. Zaimplementuj komponent `DeckList` z obsługą skeleton loading, stubu pustej listy i błędów.
6. Zaimplementuj komponent `DeckCard` prezentujący dane decku.
7. Zaimplementuj komponent `InfiniteScroll` i integrację z hookiem.
8. Zaimplementuj modal `DeckCreateModal` z formularzem, walidacją i obsługą submit.
9. Zintegruj wszystkie komponenty w widoku `DecksDashboard`.
10. Przetestuj interakcje, walidację, obsługę błędów i dostępność (aria-live, focus management).
11. Zaimplementuj testy jednostkowe i e2e dla kluczowych ścieżek.

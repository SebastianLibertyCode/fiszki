# Plan implementacji widoku StudyView

## 1. Przegląd
Widok "Nauka Fiszek" umożliwia użytkownikowi przeglądanie fiszek z wybranego decku w trybie pełnoekranowym, jedną po drugiej, z możliwością odwracania karty (flip), nawigacji przyciskami i klawiaturą oraz opuszczenia trybu nauki.

## 2. Routing widoku
Ścieżka: `/decks/:deckId/study`

- W Astro: plik `src/pages/decks/[deckId]/study.astro` z klientem React (`client:load`).

## 3. Struktura komponentów
- **StudyPage (Astro)**
  - Ładuje i renderuje komponent `StudyView` z React.
- **StudyView (React)**
  - Logika widoku, fetchowanie danych, zarządzanie stanem i zdarzeniami.
- **Flashcard**
  - Prezentacja pojedynczej fiszki z animacją flip.
- **ArrowButton**
  - Przyciski nawigacji (poprzednia/następna).
- **ExitButton**
  - Przycisk wyjścia (zamknięcie widoku nauki).
- **Loader / ErrorMessage**
  - Wyświetlanie stanu ładowania i błędów.

## 4. Szczegóły komponentów

### StudyView
- **Opis**: Główny komponent widoku nauki. Pobiera listę fiszek, przechowuje stan i obsługuje interakcje.
- **Główne elementy**:
  - `<div class="fixed inset-0 bg-gray-900 flex items-center justify-center">` – pełnoekranowy kontener
  - `<Flashcard />` – wyświetlanie karty
  - `<ArrowButton direction="left" />` i `<ArrowButton direction="right" />`
  - `<ExitButton />`
- **Obsługiwane zdarzenia**:
  - `click` na fiszce → `toggleFlip()`
  - `click` na strzałkach → `goToPrev()`/`goToNext()`
  - `keydown` → `ArrowLeft`, `ArrowRight`, `Escape`
- **Walidacja / warunki**:
  - `deckId` dostępny w URL
  - odpowiedź API to tablica obiektów z polami `id`, `question`, `answer`
- **Typy**:
  - `props`: `{ deckId: string }`
  - stan lokalny: `{ cards: StudyCardDto[]; currentIndex: number; isFlipped: boolean; loading: boolean; error: string | null }`
- **Propsy**:
  - `deckId` (z routingu)

### Flashcard
- **Opis**: Prezentuje treść pytania lub odpowiedzi i animuje flip.
- **Elementy**:
  - `<div className="relative w-80 h-48 perspective">`
  - `<div className={isFlipped ? 'flipped' : ''}>` z front/back
- **Obsługiwane zdarzenia**:
  - `onClick` → `toggleFlip`
- **Walidacja**:
  - `card.question` i `card.answer` nie są puste
- **Typy**:
  - `props`: `{ card: StudyCardDto; isFlipped: boolean }`

### ArrowButton
- **Opis**: Przycisk nawigacji między fiszkami.
- **Elementy**:
  - `<button aria-label={ariaLabel} disabled={disabled}>` z ikoną strzałki
- **Obsługiwane zdarzenia**:
  - `onClick`
- **Typy**:
  - `props`: `{ direction: 'left' | 'right'; onClick: () => void; disabled?: boolean }`

### ExitButton
- **Opis**: Przycisk zamykający widok nauki.
- **Elementy**:
  - `<button aria-label="Zamknij">×</button>`
- **Obsługiwane zdarzenia**:
  - `onClick`: `onExit`
- **Typy**:
  - `props`: `{ onExit: () => void }`

### Loader / ErrorMessage
- **Opis**: Wyświetla spinner lub komunikat błędu.
- **Propsy**:
  - `loading: boolean`
  - `error: string | null`

## 5. Typy
```ts
export interface StudyCardDto {
  id: string;
  question: string;
  answer: string;
}

interface StudyViewState {
  cards: StudyCardDto[];
  currentIndex: number;
  isFlipped: boolean;
  loading: boolean;
  error: string | null;
}
```

## 6. Zarządzanie stanem
- **Hook** `useStudyCards(deckId: string)`:
  - Fetch danych z `/api/decks/${deckId}/cards/study`
  - Zwraca `{ cards, loading, error, retry: () => void }`.
- **Stan lokalny w `StudyView`**:
  - `currentIndex`, `isFlipped`

## 7. Integracja API
- **GET** `/api/decks/:deckId/cards/study`
- **Response**: `StudyCardDto[]`
- Obsługa kodu 200, inne kody → `error` w hooku

## 8. Interakcje użytkownika
1. Kliknięcie karty → odwrócenie (flip)
2. Klik strzałki lub naciśnięcie klawisza → zmiana karty (reset flip)
3. Klik przycisku "Zamknij" lub Esc → powrót do widoku decku

## 9. Warunki i walidacja
- Blokada interakcji podczas ładowania (`loading`)
- Obsługa pustej listy (`cards.length === 0`)
- Zapobieganie indeksowaniu poza zakres
- Sprawdzenie poprawności pól `question` i `answer`

## 10. Obsługa błędów
- **Fetch error**: wyświetlenie `ErrorMessage` z przyciskiem retry
- **Timeout**: catch i komunikat
- **Brak kart**: komunikat "Brak fiszek do nauki"

## 11. Kroki implementacji
1. Utworzyć `src/pages/decks/[deckId]/study.astro` z dyrektywą `client:load`.
2. Zaimportować i wyrenderować `StudyView` przekazując `deckId`.
3. Stworzyć hook `useStudyCards` do pobierania danych.
4. Zaimplementować komponenty `Flashcard`, `ArrowButton`, `ExitButton`, `Loader`, `ErrorMessage`.
5. W `StudyView` zainicjalizować stan (`currentIndex`, `isFlipped`), pobrać dane i obsłużyć stany `loading`/`error`.
6. Dodać obsługę zdarzeń kliknięć i klawiatury (`useEffect` + `addEventListener`).
7. Zapewnić stylowanie pełnoekranowe i animację flip (Tailwind + CSS 3D).
8. Dodać ARIA (`aria-live` dla treści karty, `aria-label` dla przycisków).
9. Przetestować wszystkie interakcje i scenariusze błędów.
10. Przeprowadzić review dostępności i UX. 
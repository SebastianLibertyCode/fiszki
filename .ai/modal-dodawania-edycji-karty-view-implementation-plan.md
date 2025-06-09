# Plan implementacji widoku Modal Dodawania/Edycji Karty

## 1. Przegląd
Widok umożliwia ręczne tworzenie i edycję pojedynczej karty w decku. Jest otwierany jako modal na stronie szczegółów decku i zapewnia:
- formularz z polami pytanie i odpowiedź,
- walidację długości i wymagalności pól,
- obsługę stanów ładowania i błędów,
- dostępność (aria-modal, focus management).

## 2. Routing widoku
Modal nie ma własnej ścieżki URL. Jest wywoływany i sterowany przez komponent DeckDetailPage w ramach strony `/decks/[deckId]` (plik `src/pages/decks/[deckId].astro` lub jego React wrapper).

## 3. Struktura komponentów
```
DeckDetailPage
├─ Button (Dodaj kartę)
├─ CardList
│  └─ CardItem[]
└─ CardModal
   └─ CardForm
```

## 4. Szczegóły komponentów

### DeckDetailPage
- Opis: Strona wyświetlająca listę kart danego decku oraz przycisk do otwarcia modalu.
- Główne elementy:
  - `Button` (Dodaj kartę)
  - `CardList` (lista kart)
  - `CardModal` (modal formularza)
- Zdarzenia:
  - `onClick` przycisku, ustawia flagę otwarcia modalu
- Propsy:
  - `deckId: string`

### CardList
- Opis: Renderuje listę kart jako `CardItem`.
- Główne elementy: `<ul>` lub `<div>` z mapą kart
- Zdarzenia:
  - `onEdit(card: CardDto)`
  - `onDelete(cardId: string)`
- Propsy:
  - `cards: CardDto[]`
  - `onEdit: (card: CardDto) => void`
  - `onDelete: (cardId: string) => void`

### CardItem
- Opis: Pojedynczy element listy z treścią pytania i odpowiedzi oraz przyciskami edycji i usuwania.
- Główne elementy:
  - Tekst pytania i odpowiedzi
  - `IconButton` (Edytuj)
  - `IconButton` (Usuń)
- Zdarzenia:
  - `onEditClick()`
  - `onDeleteClick()`
- Propsy:
  - `card: CardDto`
  - `onEdit: (card: CardDto) => void`
  - `onDelete: (cardId: string) => void`

### CardModal
- Opis: Modal z formularzem do dodawania lub edycji karty.
- Główne elementy:
  - `Modal` (Shadcn/ui) z `aria-modal="true"`, `initialFocus` ustawionym na pierwsze pole
  - `CardForm`
  - `Button` (Zapisz)
  - `Button` (Anuluj)
- Zdarzenia:
  - `onClose()` – zamyka modal
  - `onSubmit(values: CardFormValues)` – wywołuje akcję zapisu
- Walidacja front-end:
  - Disable Submit, gdy pola puste lub przekroczone limity
- Propsy:
  - `isOpen: boolean`
  - `onClose: () => void`
  - `onSubmit: (values: CardFormValues) => Promise<void>`
  - `initialValues?: CardFormValues`

### CardForm
- Opis: Formularz zarządzający polami `question` i `answer`.
- Główne elementy:
  - `FormField` + `Input` dla `question` (maxLength=200)
  - `FormField` + `Textarea` dla `answer` (maxLength=500)
- Zdarzenia:
  - `onChange`, `onBlur` z React Hook Form
- Walidacja:
  - Required
  - Maksymalna długość: `question` ≤ 200, `answer` ≤ 500
- Propsy:
  - `initialValues: CardFormValues`
  - `onChange: (values: CardFormValues) => void`
- Typy:
  - `CardFormValues = { question: string; answer: string }`

## 5. Typy
- `CardDto` (z `src/types.ts`)
- `CardFormValues` (lokalny view-model)
- `CardCreateCommand = CardFormValues`
- `CardUpdateCommand = CardFormValues`
- Props komponentów opisane w sekcji 4

## 6. Zarządzanie stanem
- Hook `useCards(deckId: string)`:
  - Zwraca `cards: CardDto[]`, `isLoading: boolean`, `refetch(): void`
- Mutacje:
  - `useAddCard(deckId)`
  - `useUpdateCard(deckId, cardId)`
  - `useDeleteCard(deckId, cardId)`
- Stan lokalny:
  - `modalOpen: boolean`
  - `initialValues: CardFormValues | undefined`

## 7. Integracja API
- GET `/api/decks/${deckId}/cards?status=pending&page=1&limit=50`
- POST `/api/decks/${deckId}/cards` (body: `CardCreateCommand`)
- PUT `/api/decks/${deckId}/cards/${cardId}` (body: `CardUpdateCommand`)
- DELETE `/api/decks/${deckId}/cards/${cardId}`

## 8. Interakcje użytkownika
1. Kliknięcie "Dodaj kartę" → modal otwarty w trybie dodawania.
2. Wypełnienie pól → aktywacja przycisku "Zapisz".
3. Kliknięcie "Zapisz" → POST + spinner → po sukcesie zamknięcie + odświeżenie listy.
4. Kliknięcie "Edytuj" przy elemencie → modal z prefill → PUT → spinner → zamknięcie + odświeżenie.
5. Kliknięcie "Usuń" → dialog potwierdzenia → DELETE → odświeżenie.

## 9. Warunki i walidacja
- Pytanie: required, maxLength 200
- Odpowiedź: required, maxLength 500
- Blokada przycisku "Zapisz" przy niespełnionych warunkach
- Dodatkowa walidacja z backendu (error 400) obsługiwana inline

## 10. Obsługa błędów
- Walidacja front-end: komunikaty pod polami
- Błędy backend: mapowanie błędów 400 na pola, 500 → globalny `Toast` "Błąd serwera, spróbuj ponownie"
- Obsługa sieci: retry/backoff lub przycisk ponów w dialogu

## 11. Kroki implementacji
1. Stworzyć hook `useCards(deckId)` do fetchowania i refetchowania kart.
2. Zaprojektować i zaimplementować `CardList` oraz `CardItem`.
3. Osadzić `CardList` i przycisk "Dodaj kartę" w `DeckDetailPage`.
4. Utworzyć `CardModal` wykorzystując `Modal` z Shadcn/ui.
5. Zaimplementować `CardForm` z React Hook Form i zod.
6. Przygotować mutacje: `useAddCard`, `useUpdateCard`, `useDeleteCard`.
7. Połączyć modal z mutacjami i callbackami `onSubmit`/`onClose`.
8. Dodać loading i disabled stany do przycisków i pól.
9. Dodać walidację HTML i zod, testy jednostkowe walidacji.
10. Zaimplementować focus management i aria-modal.
11. Przetestować scenariusze dodawania, edycji i usuwania karty. 
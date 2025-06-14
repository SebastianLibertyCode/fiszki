# Architektura UI dla AI Fiszki

## 1. Przegląd struktury UI

Interfejs użytkownika opiera się na dwóch głównych układach Astro:

- Publiczny: widoki autoryzacji (rejestracja, logowanie, reset, weryfikacja e-mail)
- Chroniony: dashboard, decki, generowanie AI, przegląd kart, profil i metryki

Zarządzanie stanem i dane:

- AuthContext + Guardy tras chroniące widoki przed nieautoryzowanym dostępem
- React Query do fetchowania danych (GET, infinite scroll, retry/backoff)
- Dedykowany hook `useAiJob` obsługujący polling, timeout (20s) i exponential backoff
- JWT w httpOnly cookie z interceptorami fetch/axios

Responsywność:

- Mobile-first z Tailwind breakpoints (sm, md, lg)
- Hamburger menu na mobile, sidebar na desktop

Dostępność (a11y):

- Semantyczne elementy HTML
- Role i aria-labels w modalach i formularzach
- Focus management przy otwieraniu modali

Internacjonalizacja (i18n):

- Provider z kluczami tekstów PL/EN
- Komponent `<Text>` do renderowania tekstów

## 2. Lista widoków

1. Ekran Rejestracji

   - Ścieżka: `/register`
   - Cel: stworzenie konta z weryfikacją e-mail
   - Kluczowe informacje: formularz (e-mail, hasło, potwierdzenie), walidacja, limity prób
   - Kluczowe komponenty: `AuthForm`, `FormField`, `Button`, `Toast`
   - UX/A11y/Bezpieczeństwo: walidacja po stronie klienta, komunikaty błędów, zabezpieczenie hasła

2. Ekran Logowania

   - Ścieżka: `/login`
   - Cel: uwierzytelnienie użytkownika
   - Kluczowe informacje: e-mail, hasło, link do resetu
   - Kluczowe komponenty: `AuthForm`, `Button`, `Link` do resetu
   - UX/A11y/Bezpieczeństwo: ochrona przed brute-force, error message, focus na pierwszym polu

3. Ekran Resetowania Hasła

   - Ścieżka: `/reset-password`
   - Cel: wysłanie linku do resetu hasła
   - Kluczowe informacje: e-mail, komunikat "sprawdź skrzynkę"
   - Kluczowe komponenty: `AuthForm`, `Button`, `Toast`

4. Ekran Weryfikacji E-mail

   - Ścieżka: `/verify-email?token=...`
   - Cel: potwierdzenie konta
   - Kluczowe informacje: status weryfikacji, przycisk ponów wysyłkę
   - Kluczowe komponenty: `VerificationStatus`, `Button`

5. Dashboard – Lista Decków

   - Ścieżka: `/decks`
   - Cel: przegląd istniejących zestawów fiszek
   - Kluczowe informacje: nazwa decku, data utworzenia, źródło, liczba kart
   - Kluczowe komponenty: `Sidebar` (filtry, kategorie), `DeckList`, `DeckCard`, `InfiniteScroll`
   - UX/A11y/Bezpieczeństwo: stuby dla pustych list, skeleton loading, aria-live dla dynamicznych treści

6. Widok Szczegółów Decka

   - Ścieżka: `/decks/:deckId`
   - Cel: zarządzanie kartami i generowanie AI
   - Kluczowe informacje: lista kart (manualne + AI), stan akceptacji
   - Kluczowe komponenty: `CardList` (useInfiniteQuery), `CardItem`, `BulkActions`, `ModalCardForm`, `TextAreaWithCounter`, `NumberInput`, `ButtonGenerateAI`
   - UX/A11y/Bezpieczeństwo: optymistyczne aktualizacje, focus trap w modalach

7. Widok Nauki Fiszek

   - Ścieżka: `/decks/:deckId/study`
   - Cel: przeglądanie po kolei fiszek z danego decka w trybie pełnoekranowym
   - Kluczowe informacje: fiszka ma dwie strony (pytanie, odpowiedź), domyślnie wyświetlana jest strona pytania, kliknięcie obraca fiszkę, nawigacja za pomocą strzałek (poprzednia, następna) po obu stronach ekranu
   - Kluczowe komponenty: `StudyView`, `Flashcard`, `ArrowButton`, `FlipAnimation`
   - UX/A11y/Bezpieczeństwo: pełnoekranowe wyświetlanie, animacja odwracania, obsługa strzałek klawiaturowych, aria-live dla zmiany treści, mechanizm wyjścia (przycisk zamknij lub Esc)

8. Widok Generowania Fiszek AI

   - Wbudowany w szczegóły decka lub ścieżka `/decks/:deckId/generate`
   - Cel: wprowadzenie tekstu i liczby fiszek, uruchomienie AI
   - Kluczowe informacje: licznik znaków, default count, spinner + licznik czasu
   - Kluczowe komponenty: `TextAreaWithCounter`, `NumberInput`, `SpinnerTimeout`, `Button`, `Toast`
   - UX/A11y/Bezpieczeństwo: blokada >10 000 znaków, timeout 20 s, fallback retry

9. Modal Dodawania/Edycji Karty

   - Cel: ręczne CRUD kart
   - Kluczowe informacje: pytanie ≤200 znaków, odpowiedź ≤500 znaków
   - Kluczowe komponenty: `Modal`, `FormField`, `Button`
   - UX/A11y/Bezpieczeństwo: aria-modal, focus management, walidacja

10. Widok Przeglądu AI Fiszek

- Zagnieżdżony w deck detail
- Cel: batch accept/reject wygenerowanych kart
- Kluczowe informacje: lista nowych kart, przycisk akceptuj/odrzuć, status
- Kluczowe komponenty: `CardList`, `BulkActions`, `Toast`

11. Profil Użytkownika

    - Ścieżka: `/profile`
    - Cel: przegląd zużycia tokenów i ustawień
    - Kluczowe informacje: widget zużycia tokenów, alerty limitu, edycja profilu
    - Kluczowe komponenty: `TokenUsageWidget`, `ProgressBar`, `FormField`, `Button`

12. Widok Metryk SLA
    - Ścieżka: `/metrics`
    - Cel: analiza latencji i outcome AI
    - Kluczowe informacje: wykresy P95, średnie czasy, wskaźniki sukcesu
    - Kluczowe komponenty: `Chart`, `FilterDate`, `Table`

## 3. Mapa podróży użytkownika

Przykładowy główny scenariusz (generowanie fiszek AI):

1. Użytkownik loguje się (/login).
2. Przechodzi do dashboardu (/decks), wybiera deck lub tworzy nowy.
3. W widoku decka (/decks/:deckId) otwiera sekcję generowania AI.
4. Wprowadza tekst i liczbę fiszek, klika "Generuj".
5. Widzi spinner z licznikiem czasu, czeka na wynik lub timeout.
6. Po sukcesie przegląda listę AI-fiszek, akceptuje lub odrzuca pojedynczo lub hurtowo.
7. Zapisane karty (accepted) pojawiają się w głównej liście, odrzucone są kasowane.
8. W razie potrzeby użytkownik edytuje karty ręcznie przez modal.
9. Użytkownik monitoruje zużycie tokenów w profilu (/profile).
10. Dla pogłębionej analizy otwiera metryki SLA (/metrics).

## 4. Układ i struktura nawigacji

- Routing Astro:
  - Publiczne: `/login`, `/register`, `/reset-password`, `/verify-email`
  - Chronione: `/decks`, `/decks/:deckId`, `/decks/:deckId/study`, `/profile`, `/metrics`
- Layouty:
  - `PublicLayout` z prostym headerem
  - `ProtectedLayout` z sidebar (na desktop) i topbar z menu użytkownika i i18n switcher
- Sidebar:
  - Filtry: kategorie (multi-select), przycisk "Nowy deck"
  - Lista decków w skrócie (miniaturki)
- Topbar:
  - Avatar + menu profilu
  - Przełącznik języka

## 5. Kluczowe komponenty

- AuthForm (formularze rejestracji, logowania, resetu)
- TextAreaWithCounter (limity i licznik znaków)
- NumberInput (minimalna wartość 1)
- DeckList + DeckCard (lista i kafelki decków)
- Sidebar (filtry, multi-select kategorii)
- CardList + CardItem (lista kart z infinite scroll)
- Modal + ModalCardForm (CRUD kart)
- SpinnerTimeout (AI job spinner z timeoutem 20s)
- BulkActions (batch accept/reject)
- TokenUsageWidget + ProgressBar
- Chart + Table (widok metryk)
- Toast/Alert (komunikaty sukcesu/błędu)
- i18nProvider + `<Text>` (internacjonalizacja)
- ProtectedRoute / Guard (ochrona widoków)
- StudyView (komponent widoku nauki fiszek)
- Flashcard (komponent pojedynczej fiszki z dwoma stronami i animacją odwracania)
- ArrowButton (nawigacja pomiędzy fiszkami)
- FlipAnimation (animacja obracania fiszki)
- i18nProvider + `<Text>` (internacjonalizacja)
- StudyView (komponent widoku nauki fiszek)
- Flashcard (komponent pojedynczej fiszki z dwoma stronami i animacją odwracania)
- ArrowButton (nawigacja pomiędzy fiszkami)
- FlipAnimation (animacja obracania fiszki)
- ProtectedRoute / Guard (ochrona widoków)

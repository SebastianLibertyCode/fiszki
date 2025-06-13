<plan_testów>

# Plan Testów dla Projektu "Fiszki"

## 1. Wprowadzenie i cele testowania  
Celem testów jest zapewnienie jakości, stabilności i bezpieczeństwa aplikacji "Fiszki" poprzez weryfikację kluczowych funkcjonalności, integracji z usługami zewnętrznymi (Supabase, OpenRouter.ai), zgodności z wymaganiami biznesowymi oraz komfortu użytkownika.

## 2. Zakres testów  
- Frontend (Astro + React + Tailwind + Shadcn/ui): komponenty interaktywne, strony, styling, responsywność  
- Backend (API Astro + Supabase): endpointy auth, decks, cards, categories  
- Usługi (lib/services): logika biznesowa deck.service, card.service, auth.service, OpenRouterService  
- Hooki (lib/hooks): useDecks, useCards, useCategories  
- Integracja z Supabase (baza danych, autentykacja)  
- Integracja z OpenRouter.ai (generowanie kart)  
- Środowiska: lokalne, testowe, e2e  

## 3. Typy testów do przeprowadzenia  
1. Testy jednostkowe (Vitest + React Testing Library + MSW)  
2. Testy integracyjne (Vitest + MSW dla mockowania API)  
3. Testy end-to-end (Playwright)  
4. Testy UI i wizualne (Storybook + Chromatic)  
5. Testy wydajnościowe (k6 dla API, Lighthouse CI dla frontendu)  
6. Testy bezpieczeństwa (sprawdzanie właściwej autoryzacji, walidacja danych)  
7. Testy dostępności (Axe-core + Lighthouse)
8. Testy kontraktowe (Pact dla API)

## 4. Scenariusze testowe dla kluczowych funkcjonalności  

### 4.1 Autentykacja i autoryzacja  
- Rejestracja użytkownika: poprawne dane → sukces, brak hasła/email → walidacja  
- Logowanie: poprawne/niepoprawne dane, sesja, token w ciasteczku  
- Reset hasła: generowanie linku, użycie tokena → zmiana hasła, wygasły/nieprawidłowy token  
- Middleware chroniący trasy dla zalogowanych  

### 4.2 Zarządzanie taliami (decks)  
- Wyświetlanie listy talii (pusta vs. z danymi)  
- Tworzenie nowej talii: poprawne/niepoprawne dane (nazwa)  
- Edycja i usuwanie talii: potwierdzenie, odświeżenie listy  

### 4.3 Operacje na kartach (cards)  
- Wyświetlanie listy kart w talii  
- Generowanie kart przez AI: poprawne wywołanie OpenRouter, obsługa błędów, timeout  
- Ręczne dodawanie/edycja/usuwanie kart  
- Walidacja pól (pytanie, odpowiedź, tagi)  

### 4.4 Sesja nauki (study)  
- Przejście przez kolejne karty, oznaczanie jako zapamiętane/niezapamiętane  
- Statystyki postępu (pasek postępu, licznik)  

### 4.5 API Endpointy  
Dla każdej z grup (`auth`, `decks`, `cards`):  
- GET/POST/PUT/DELETE → statusy HTTP, payload, walidacja nagłówków  
- Testy kontraktowe z użyciem Pact
- Testy wydajnościowe z użyciem k6

### 4.6 UI i dostępność  
- Responsywność na różnych rozdzielczościach  
- Sprawdzenie kontrastu i dostępności (Axe-core)
- Testy wizualne komponentów (Storybook + Chromatic)
- Obsługa klawiatury, aria-labels  
- Snapshoty dla komponentów statycznych

## 5. Środowisko testowe  
- Node.js + Astro w trybie testowym  
- MSW do mockowania API (Supabase i OpenRouter)  
- Playwright dla testów e2e  
- Baza testowa resetowana przed każdą kampanią testową  
- GitHub Actions jako platforma CI/CD

## 6. Narzędzia do testowania  
- Vitest + React Testing Library (testy jednostkowe i integracyjne)
- MSW (mockowanie API)
- Playwright (testy e2e)  
- ESLint, Prettier (kontrola jakości kodu)  
- @testing-library/user-event v14+ (symulacja interakcji)
- Storybook + Chromatic (testy wizualne i dokumentacja)
- Axe-core + Lighthouse (audyt dostępności)  
- k6 (testy wydajnościowe)
- Pact (testy kontraktowe)
- GitHub Actions (CI/CD pipeline)

## 7. Harmonogram testów  
| Faza                    | Zakres                        | Czas trwania |
|-------------------------|-------------------------------|--------------|
| Przygotowanie środowiska| Konfiguracja narzędzi         | 3 dni       |
| Jednostkowe i integracyjne | Usługi, hooki, komponenty  | 2 tygodnie   |
| Visual testing         | Setup Storybook, komponenty UI | 1 tydzień    |
| End-to-end             | Kluczowe scenariusze użytk.   | 2 tygodnie   |
| Kontraktowe            | API endpoints                 | 1 tydzień    |
| Wydajność i dostępność | k6, Lighthouse, Axe-core      | 1 tydzień    |
| Finalizacja i poprawki | Regresja, dokumentacja        | 1 tydzień    |

## 8. Kryteria akceptacji testów  
- Pokrycie jednostkowe ≥ 80% linii krytycznych (usługi, API)  
- Brak krytycznych błędów w scenariuszach e2e  
- Wszystkie testy przechodzą bez flaków przez 3 kolejne uruchomienia CI  
- Audyt a11y: wynik ≥ 90 w Lighthouse i brak krytycznych błędów w Axe-core
- Wszystkie testy wizualne zatwierdzone w Chromatic
- Testy wydajnościowe spełniają ustalone progi w k6

## 9. Role i odpowiedzialności w procesie testowania  
- QA Lead: koordynacja, priorytetyzacja, raportowanie  
- QA Engineer: pisanie i utrzymanie testów, analiza wyników  
- DevOps: konfiguracja GitHub Actions, środowisk testowych  
- Programiści: praca nad naprawą defektów, wspieranie QA w testach  

## 10. Procedury raportowania błędów  
1. Rejestracja w systemie GitHub Issues  
2. Szablon zgłoszenia: kroki reprodukcji, oczekiwane vs. otrzymane, zrzuty ekranu/logi  
3. Priorytetyzacja: Blocker, Critical, Major, Minor  
4. Przypisanie do odpowiedniej osoby zespołu  
5. Weryfikacja poprawki: test regresyjny  
6. Automatyczne testy regresyjne w GitHub Actions

</plan_testów>

# Dokument wymagań produktu (PRD) - AI Fiszki

## 1. Przegląd produktu
Aplikacja webowa "AI Fiszki" umożliwia studentom i osobom uczącym się szybko generować, przeglądać i zarządzać zestawami fiszek edukacyjnych. Dzięki integracji z API OpenAI (gpt‑4o‑mini) użytkownicy otrzymują automatycznie wygenerowane pytania i odpowiedzi na podstawie wprowadzonego tekstu oraz mają pełną kontrolę nad ręcznym tworzeniem i edycją kart.

## 2. Problem użytkownika
Tworzenie wysokiej jakości fiszek edukacyjnych metodą ręczną jest czasochłonne i demotywujące. Użytkownicy potrzebują szybkiego sposobu generowania fiszek oraz przejrzystych narzędzi do późniejszej edycji i powtórek.

## 3. Wymagania funkcjonalne
1. Autoryzacja i profil użytkownika
   - rejestracja z weryfikacją e‑mail (link ważny 24 h, max 3 próby ponownego wysłania)
   - logowanie przez e‑mail i hasło
   - reset hasła przez e‑mail
   - możliwość aktualizacji profilu użytkownika
2. Zarządzanie deckami
   - tworzenie, edycja, usuwanie i listowanie decków z następującymi polami:
     - id, user_id, nazwa (max 100 znaków), opis (opcjonalny), źródło (URL), limit kart (opcjonalny), kategorie (opcjonalne)
   - wyświetlanie listy decków użytkownika
3. Tworzenie i zarządzanie kartami
   - ręczne dodawanie, edycja, usuwanie kart:
     - pytanie (max 200 znaków), odpowiedź (max 500 znaków)
4. Generowanie fiszek przez AI
   - textarea z licznikiem znaków (limit 10 000 znaków, blokada i komunikat o przekroczeniu)
   - pole numeryczne do ustawiania maksymalnej liczby kart
   - domyślna relacja znak→fiszka: 1 fiszka na 500 znaków
   - żądanie do API AI z timeoutem 20 s, abort i retry/backoff w kolejce z widocznym spinnerem lub paskiem postępu i przyciskiem ponów
   - wyświetlenie listy wygenerowanych kart wraz z odnośnikiem do fragmentu źródłowego tekstu
5. Przegląd fiszek
   - akceptacja i odrzucenie każdej karty (status zaakceptowana/odrzucona)
   - możliwość zmiany statusu po początkowej decyzji
   - usunięcie odrzuconych kart po zakończeniu procesu przeglądu
   - rejestrowanie timestampów started_at i finished_at w celu wyliczenia time_spent (bez wyświetlania w UI)
6. Monitorowanie i ograniczenia
   - śledzenie zużycia tokenów OpenAI na poziomie aplikacji i użytkownika
   - blokowanie dalszych żądań AI po przekroczeniu darmowego limitu tokenów
   - mierzenie SLA generacji (P95 < 20 s)
7. Obsługa błędów
   - przyjazne komunikaty w UI
   - retry/backoff z kolejką zadań
   - tryb degradacji (możliwość ręcznego dodania karty przy awarii AI)

## 4. Granice produktu
Zakres MVP:
- w pełni działające CRUD dla autoryzacji, decków i kart
- AI‑generacja fiszek na ograniczonym tekście (max 10 000 znaków)
- prosty system monitorowania tokenów i SLA
- brak zaawansowanego algorytmu powtórek (korzystanie z istniejącej gotowej implementacji)
- brak importu z plików PDF, DOCX itp.
- brak mobilnej wersji aplikacji
- brak współdzielenia zestawów między użytkownikami
- brak integracji z zewnętrznymi platformami edukacyjnymi

## 5. Historyjki użytkowników

US-001
Tytuł: Rejestracja i weryfikacja e‑mail
Opis: Jako nowy użytkownik chcę się zarejestrować i otrzymać link weryfikacyjny na e‑mail, aby aktywować konto.
Kryteria akceptacji:
- po wypełnieniu formularza rejestracji system wysyła e‑mail z linkiem ważnym 24 h
- użytkownik może wysłać ponownie link maksymalnie 3 razy
- kliknięcie linku aktywuje konto i umożliwia logowanie

US-002
Tytuł: Logowanie
Opis: Jako zarejestrowany użytkownik chcę się zalogować przez e‑mail i hasło, aby uzyskać dostęp do aplikacji.
Kryteria akceptacji:
- prawidłowe dane logowania kierują do głównego widoku decków
- nieprawidłowe dane wyświetlają komunikat o błędnych danych

US-003
Tytuł: Reset hasła
Opis: Jako użytkownik chcę odzyskać dostęp do konta przez reset hasła, aby ponownie się zalogować.
Kryteria akceptacji:
- system wysyła e‑mail z linkiem do resetu ważnym 24 h
- kliknięcie linku pozwala ustawić nowe hasło

US-004
Tytuł: Aktualizacja profilu
Opis: Jako zalogowany użytkownik chcę edytować dane profilowe, aby aktualizować swoje informacje.
Kryteria akceptacji:
- formularz profilu wyświetla aktualne dane
- po zapisaniu zmiany są widoczne w profilu

US-005
Tytuł: Tworzenie decku
Opis: Jako użytkownik chcę utworzyć nowy deck z nazwą, opisem, linkiem źródłowym i limitem kart, aby grupować fiszki.
Kryteria akceptacji:
- formularz przyjmuje nazwę, opcjonalny opis, źródło, limit kart i kategorie
- po zapisaniu deck pojawia się na liście decków

US-006
Tytuł: Listowanie decków
Opis: Jako użytkownik chcę zobaczyć listę wszystkich moich decków, aby szybko nawigować między nimi.
Kryteria akceptacji:
- lista wyświetla nazwę, datę utworzenia i źródło każdego decku
- kliknięcie przenosi do widoku kart w decku

US-007
Tytuł: Edycja decku
Opis: Jako użytkownik chcę edytować właściwości decku, aby poprawić lub zaktualizować dane.
Kryteria akceptacji:
- zmiany nazwy, opisu, źródła, limitu kart lub kategorii można zapisać
- po zapisaniu zmiany są widoczne na liście i w widoku decku

US-008
Tytuł: Usuwanie decku
Opis: Jako użytkownik chcę usunąć niepotrzebny deck, aby utrzymać porządek w aplikacji.
Kryteria akceptacji:
- po potwierdzeniu deck zostaje usunięty z listy
- powiązane karty są kasowane z bazy danych

US-009
Tytuł: Ręczne dodawanie karty
Opis: Jako użytkownik chcę dodać kartę ręcznie z pytaniem i odpowiedzią, aby uzupełnić deck.
Kryteria akceptacji:
- formularz wymaga pytania (max 200 znaków) i odpowiedzi (max 500 znaków)
- karta pojawia się w widoku decku po zapisaniu

US-010
Tytuł: Edycja karty
Opis: Jako użytkownik chcę edytować treść istniejącej karty, aby poprawić błędy lub uzupełnić informacje.
Kryteria akceptacji:
- możliwa zmiana pytania i odpowiedzi z zachowaniem limitów znaków
- zapisane zmiany od razu widoczne

US-011
Tytuł: Usuwanie karty
Opis: Jako użytkownik chcę usunąć niepotrzebną kartę z decku.
Kryteria akceptacji:
- karta znika z widoku po potwierdzeniu usunięcia

US-012
Tytuł: Generowanie fiszek AI
Opis: Jako użytkownik chcę wkleić tekst (do 10 000 znaków) i ustawić maksymalną liczbę kart, aby AI wygenerowało zestaw fiszek.
Kryteria akceptacji:
- pole tekstowe pokazuje licznik znaków i blokuje przekroczenie 10 000
- domyślna liczba kart ustawiana według relacji 1 kartka/500 znaków
- po kliknięciu generuj wywołanie AI trwa maks. 20 s (P95)
- po sukcesie lista kart pojawia się z odniesieniem do źródła tekstu

US-013
Tytuł: Obsługa przekroczenia limitu tekstu
Opis: Jako użytkownik chcę otrzymać komunikat błędu, gdy wkleję tekst dłuższy niż 10 000 znaków.
Kryteria akceptacji:
- przy próbie generacji tekstu >10 000 znaków wyświetlany jest komunikat "Limit znaków przekroczony"
- żądanie do AI nie jest wysyłane

US-014
Tytuł: Retry i backoff przy błędzie AI
Opis: Jako użytkownik chcę widzieć pasek postępu i przycisk ponów, gdy żądanie do AI przekroczy timeout lub wystąpi błąd.
Kryteria akceptacji:
- timeout po 20 s przerywa połączenie z AI
- UI wyświetla spinner lub pasek postępu i przycisk „Ponów”
- kliknięcie „Ponów” inicjuje kolejną próbę

US-015
Tytuł: Akceptacja i odrzucenie fiszek
Opis: Jako użytkownik chcę zaakceptować lub odrzucić każdą fiszkę wygenerowaną przez AI.
Kryteria akceptacji:
- przycisk zaakceptuj/odrzuć przy każdej karcie
- status karty zmienia się na zaakceptowany lub odrzucony
- możliwa zmiana statusu po zapisaniu

US-016
Tytuł: Usuwanie odrzuconych kart
Opis: Jako użytkownik chcę, aby odrzucone karty były automatycznie usuwane po zakończeniu przeglądu.
Kryteria akceptacji:
- po wyjściu z trybu przeglądu odrzucone karty są usunięte z decku

US-017
Tytuł: Monitorowanie zużycia tokenów
Opis: Jako użytkownik chcę być blokowany przed generowaniem kolejnych fiszek, gdy wykorzystam darmowy limit tokenów.
Kryteria akceptacji:
- zużycie tokenów jest śledzone per użytkownik
- przy próbie przekroczenia limitu wyświetlany jest komunikat "Limit tokenów przekroczony"

US-018
Tytuł: Rejestrowanie czasu spędzonego na karcie
Opis: Jako produkt chcę rejestrować czas od rozpoczęcia generacji do akceptacji/odrzucenia karty, aby analizować efektywność.
Kryteria akceptacji:
- w bazie zapisywane są timestampy started_at i finished_at dla każdej karty
- system oblicza time_spent jako różnicę timestampów

## 6. Metryki sukcesu
- 75% fiszek wygenerowanych przez AI zostaje zaakceptowanych przez użytkowników
- 75% wszystkich nowych fiszek jest generowanych przez AI
- SLA dla generacji AI: P95 < 20 s
- Utrzymanie zużycia tokenów w darmowym limicie GPT‑4o‑mini
- Analiza średniego time_spent na kartę w celu optymalizacji procesu
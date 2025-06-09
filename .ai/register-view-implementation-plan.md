# Plan implementacji widoku Rejestracji

## 1. Przegląd
Widok rejestracji umożliwia nowym użytkownikom utworzenie konta w aplikacji poprzez wypełnienie formularza rejestracyjnego i weryfikację adresu e-mail.

## 2. Routing widoku
Ścieżka: `/register`

## 3. Struktura komponentów
- **AuthForm**: Główny komponent formularza rejestracji.
  - **FormField**: Komponenty dla pól e-mail, hasło, potwierdzenie hasła.
  - **Button**: Komponent przycisku do przesyłania formularza.
  - **Toast**: Komponent do wyświetlania komunikatów zwrotnych.

## 4. Szczegóły komponentów
### AuthForm
- **Opis komponentu**: Zarządza logiką formularza rejestracji i jego przesyłaniem.
- **Główne elementy**: FormField (Email, Password, Password Confirmation), Button (Submit), Toast (Feedback)
- **Obsługiwane interakcje**: Przesyłanie formularza, walidacja pól, wyświetlanie komunikatów.
- **Obsługiwana walidacja**: Walidacja formatu e-mail, siły hasła, zgodności hasła i potwierdzenia.
- **Typy**: UserRegistrationDto
- **Propsy**: Brak

### FormField
- **Opis komponentu**: Zarządza pojedynczymi polami wejściowymi z walidacją.
- **Główne elementy**: Input, Label, Error Message
- **Obsługiwane interakcje**: Wprowadzanie danych, walidacja na bieżąco.
- **Obsługiwana walidacja**: Walidacja formatu i wymagań pola.
- **Typy**: Brak
- **Propsy**: type, value, onChange, onBlur

### Button
- **Opis komponentu**: Reużywalny komponent przycisku dla akcji formularza.
- **Główne elementy**: Button
- **Obsługiwane interakcje**: Kliknięcie przycisku.
- **Obsługiwana walidacja**: Brak
- **Typy**: Brak
- **Propsy**: onClick, disabled

### Toast
- **Opis komponentu**: Wyświetla komunikaty sukcesu lub błędu użytkownikowi.
- **Główne elementy**: Message
- **Obsługiwane interakcje**: Automatyczne zamykanie po czasie.
- **Obsługiwana walidacja**: Brak
- **Typy**: Brak
- **Propsy**: message, type

## 5. Typy
- **UserRegistrationDto**: { email: string, password: string, passwordConfirmation: string }

## 6. Zarządzanie stanem
- **useRegistrationForm**: Zarządza stanem formularza i walidacją.

## 7. Integracja API
- **registerUser**: Wywołuje API Supabase do rejestracji nowego użytkownika.

## 8. Interakcje użytkownika
- **Przesyłanie formularza**: Rejestruje użytkownika.

## 9. Warunki i walidacja
- Walidacja formatu e-mail i siły hasła po stronie klienta.
- Zapewnienie odpowiednich komunikatów sukcesu lub błędu z API.

## 10. Obsługa błędów
- **Niepowodzenie dostarczenia e-maila**: Wyświetlenie komunikatu o błędzie i umożliwienie ponowienia.
- **Nieprawidłowe dane wejściowe**: Pokazanie błędów walidacji i zablokowanie przesyłania formularza.

## 11. Kroki implementacji
1. Utwórz komponent `AuthForm` z polami e-mail, hasło, potwierdzenie hasła.
2. Dodaj walidację po stronie klienta dla każdego pola.
3. Zaimplementuj logikę przesyłania formularza i integrację z API Supabase.
4. Zaimplementuj komponent `Toast` do wyświetlania komunikatów zwrotnych.
5. Przetestuj widok pod kątem poprawności działania i bezpieczeństwa. 
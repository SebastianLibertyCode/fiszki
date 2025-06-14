# Specyfikacja modułu autentykacji (Rejestracja, Logowanie, Odzyskiwanie hasła)

Dokument opisuje architekturę front- i backendu oraz integrację z Supabase Auth w projekcie opartym na Astro 5, TypeScript 5, React 19, Tailwind 4 i Shadcn/ui.

---

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Strony i layouty

1. `src/layouts/AuthLayout.astro`

   - Layout dedykowany stronom auth (register, login, reset-password, update-password).
   - Minimalny header, responsywny kontener formularza, footer.
   - Przy braku sesji wyświetla formularz; przy obecnej sesji przekierowuje do `/dashboard`.

2. Strony Astro (w katalogu `src/pages`):

   - `register.astro` – formularz rejestracji.
   - `login.astro` – formularz logowania.
   - `reset-password.astro` – formularz wprowadzenia adresu e-mail do resetu.
   - `update-password/[token].astro` – formularz ustawienia nowego hasła (token w URL).
   - `profile.astro` lub inne – przykładowa strona chroniona.
   - `verify-email/[token].astro` – obsługa linku weryfikacyjnego, potwierdzenie konta po kliknięciu linku e-mail.
   - `resend-verification.astro` – strona/komponent umożliwiający ponowne wysłanie linku weryfikacyjnego z licznikiem prób.

3. Modyfikacja istniejących layoutów (np. `src/layouts/MainLayout.astro`):
   - Rozszerzenie o stan uwierzytelnienia.
   - Menu nawigacyjne z opcjami Logowanie/Rejestracja lub Profil/Wyloguj.

### 1.2 Komponenty React (klient)

W katalogu `src/components/auth/`:

- `RegisterForm.tsx` (Shadcn/ui)
- `LoginForm.tsx`
- `ResetPasswordForm.tsx`
- `UpdatePasswordForm.tsx`
- `ResendVerificationForm.tsx`

Każdy formularz odpowiada za:

- Walidację (z użyciem Zod + react-hook-form).
- Wywołanie `fetch` do odpowiedniego endpointu API.
- Wyświetlanie komunikatów sukcesu/ błędu.
- Przekierowanie po sukcesie (np. do `/login` lub `/dashboard`).

### 1.3 Rozdzielenie odpowiedzialności

- Strony Astro:
  - SSR, weryfikacja obecności sesji (middleware), wyświetlenie layoutu.
  - Odbiór eventów formularzy (wykorzystanie Astro Server Actions lub klient-FETCH).
- Komponenty React:
  - Pełna obsługa UI, lokalne zarządzanie stanem i walidacją.
  - Integracja z Shadcn/ui i Tailwind.

### 1.4 Walidacja i komunikaty błędów

| Pole                | Reguła                                    | Komunikat                                                       |
| ------------------- | ----------------------------------------- | --------------------------------------------------------------- |
| Email               | required, format e-mail                   | „Adres e-mail jest wymagany” / „Nieprawidłowy format e-mail”    |
| Hasło               | required, min 8 znaków, 1 cyfra, 1 wielka | „Hasło musi mieć min. 8 znaków, zawierać cyfrę i wielką literę” |
| Potwierdzenie hasła | required, równość z hasłem                | „Hasła muszą być zgodne”                                        |

Dodatkowe: obsługa błędów z backendu (np. konflikt e-mail przy rejestracji).

### 1.5 Najważniejsze scenariusze

1. Rejestracja: weryfikacja danych → wywołanie `/api/auth/register` → wyświetlenie potwierdzenia → przekierowanie do logowania.
2. Logowanie: walidacja → `/api/auth/login` → zapis sesji (cookie) → przekierowanie do `/dashboard`.
3. Reset hasła: podanie e-mail → `/api/auth/reset-password` → widok potwierdzenia wysłania maila.
4. Ustaw nowego hasła: dostarczenie tokena w URL → formularz `/api/auth/update-password` → przekierowanie na logowanie.
5. Weryfikacja e-mail: użytkownik klika link z e-maila → `verify-email/[token].astro` → wywołanie `/api/auth/verify-email` → potwierdzenie konta i przekierowanie do `/login` lub komunikat o błędzie (token wygasł/nieprawidłowy).
6. Ponowne wysłanie linku weryfikacyjnego: użytkownik otwiera `resend-verification.astro` → korzysta z `ResendVerificationForm` → wywołanie `/api/auth/resend-verification` → komunikat o sukcesie lub o przekroczeniu limitu prób.

---

## 2. LOGIKA BACKENDOWA

### 2.1 Struktura endpointów (Astro Server Functions)

Katalog: `src/pages/api/auth/`

- `register.ts` (POST) – rejestracja użytkownika.
- `login.ts` (POST) – logowanie i generowanie sesji.
- `logout.ts` (POST) – wylogowanie (kasowanie cookie).
- `reset-password.ts` (POST)– inicjacja resetu (wysyłka maila).
- `update-password.ts` (POST)– finalizacja resetu (ustawienie nowego hasła).
- `verify-email.ts` (GET) – weryfikacja konta na podstawie tokenu z linku.
- `resend-verification.ts` (POST) – ponowne wysłanie linku weryfikacyjnego (limit 3 próby).

### 2.2 Modele i DTO

W `src/types.ts`:

- `AuthRegisterDTO { email: string; password: string; }`
- `AuthLoginDTO { email: string; password: string; }`
- `ResetPasswordDTO { email: string; }`
- `UpdatePasswordDTO { token: string; newPassword: string; }`
- `VerifyEmailDTO { token: string; }`
- `ResendVerificationDTO { email: string; }`

### 2.3 Mechanizm walidacji

- Zestaw schematów Zod w `src/lib/validation.ts`.
- Weryfikacja na wejściu w każdej funkcji API.
- Błędy schematu → odpowiedź 400 z listą walidacji.

### 2.4 Obsługa wyjątków i logging

- Obsługa błędów z Supabase SDK (mapowanie kodów):
  - 400 Bad Request – nieprawidłowe dane.
  - 401 Unauthorized – błędne dane logowania lub token.
  - 409 Conflict – e-mail już istnieje.
  - 429 Too Many Requests – przekroczono limit wysyłania linków weryfikacyjnych.
  - 500 Internal – nieoczekiwany błąd.
- Logowanie błędów na serwerze (konsola lub zewnętrzny logger).
- Użycie guard clauses na początku funkcji.

### 2.5 Aktualizacja SSR i middleware

- W `src/middleware/index.ts`:
  - Zdefiniować trasy chronione (np. `/dashboard`, `/decks`, `/cards`, `/profile`); brak sesji → przekierowanie do `/login`.
  - Zdefiniować publiczne trasy (np. `/`, `/auth/*`, `/verify-email/*`, `/resend-verification`, ad-hoc rule creation); dostęp bez sesji.
  - Próba wejścia na `/auth/*` przy zalogowanym użytkowniku → przekierowanie do `/dashboard`.

---

## 3. SYSTEM AUTENTYKACJI

### 3.1 Integracja z Supabase Auth

Plik: `src/db/supabaseClient.ts`

```ts
import { createClient } from "@supabase/supabase-js";

export const supabaseClient = createClient(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_ANON_KEY);

export const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
```

### 3.2 Operacje uwierzytelniania

| Funkcja                           | Supabase SDK                                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Rejestracja                       | `supabaseClient.auth.signUp({ email, password }, { emailRedirectTo: import.meta.env.PUBLIC_APP_URL + '/verify-email' })` |
| Logowanie                         | `supabaseClient.auth.signInWithPassword({ email, password })`                                                            |
| Wylogowanie                       | `supabaseClient.auth.signOut()`                                                                                          |
| Wysłanie maila resetującego hasło | `supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: import.meta.env.PUBLIC_APP_URL + '/update-password' })`  |
| Ustawienie nowego hasła           | `supabaseAdmin.auth.updateUser({ password }, token)`                                                                     |

### 3.3 Bezpieczeństwo i sesje

- Sesje JWT zapisywane w HTTP-only cookie za pomocą Astro session.
- Redirecty chroniące trasy chronione.
- Rate limiting dla endpointów auth (zapobieganie brute-force).

### 3.4 Konfiguracja środowiska

W `.env` / CI:

```bash
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

_Plik autogen. Specyfikacja gotowa do implementacji._

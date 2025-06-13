# Dokumentacja Środowiska Testowego

## Przegląd

Projekt "Fiszki" wykorzystuje kompleksowe środowisko testowe składające się z:

- **Vitest** - Testy jednostkowe i integracyjne
- **Playwright** - Testy end-to-end
- **MSW (Mock Service Worker)** - Mockowanie API w testach
- **React Testing Library** - Testowanie komponentów React
- **GitHub Actions** - CI/CD pipeline

## Struktura Katalogów

```
├── src/
│   ├── __tests__/          # Testy jednostkowe i integracyjne
│   │   └── utils/          # Utilities testowe
│   └── test/               # Konfiguracja testów
│       ├── setup.ts        # Setup Vitest
│       └── msw.ts          # Mock Service Worker
└── tests/
    └── e2e/                # Testy Playwright E2E
```

## Uruchamianie Testów

### Testy Jednostkowe (Vitest)

```bash
# Uruchom wszystkie testy
npm run test

# Tryb watch (automatyczne ponowne uruchamianie)
npm run test:watch

# UI mode dla interaktywnego debugowania
npm run test:ui

# Testy z pokryciem kodu
npm run test:coverage

# Specific test file
npm run test:card-service
```

### Testy E2E (Playwright)

```bash
# Uruchom testy e2e w headless mode
npm run test:e2e

# Uruchom z widoczną przeglądarką
npm run test:e2e:headed

# Interactive UI mode
npm run test:e2e:ui

# Debug mode (krok po kroku)
npm run test:e2e:debug

# Pokaż raport z ostatnich testów
npm run test:e2e:report
```

### Wszystkie Testy

```bash
# Uruchom zarówno testy jednostkowe jak i e2e
npm run test:all
```

## Pisanie Testów

### Testy Jednostkowe

```typescript
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '@/test/msw';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Your Test Suite', () => {
  it('should test something', () => {
    expect(true).toBe(true);
  });
});
```

### Testy Komponentów React

```typescript
import { render, screen } from '@/__tests__/utils/test-utils';
import { YourComponent } from '@/components/YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Testy E2E

```typescript
import { test, expect } from '@playwright/test';

test('should perform user workflow', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="button"]');
  await expect(page).toHaveURL('/expected-url');
});
```

## Mock Service Worker (MSW)

MSW jest skonfigurowany w `src/test/msw.ts` i automatycznie mockuje:

- Endpointy autentykacji (`/api/auth/*`)
- API talii (`/api/decks/*`)
- API kart (`/api/decks/:id/cards/*`)
- API kategorii (`/api/categories`)
- OpenRouter AI API

## Konfiguracja CI/CD

Wszystkie testy są automatycznie uruchamiane w GitHub Actions przy każdym push i pull request.

## Najlepsze Praktyki

1. **Używaj data-testid** dla elementów w testach E2E
2. **Mockuj zewnętrzne zależności** w testach jednostkowych
3. **Testuj zachowania, nie implementację**
4. **Utrzymuj testy szybkie i niezależne**
5. **Używaj describe/it dla logicznego grupowania**

## Debugowanie

### Vitest
- Użyj `npm run test:ui` dla interaktywnego debugowania
- Dodaj `debugger` w kodzie testu
- Sprawdź coverage report w `coverage/index.html`

### Playwright
- Użyj `npm run test:e2e:debug` dla step-by-step debugging
- Sprawdź trace viewer w raporcie
- Skorzystaj z screenshot i video recording

## Problemy i Rozwiązania

### Port już w użyciu
Jeśli port 4321 jest zajęty, zmień go w `playwright.config.ts`

### Testy flaky
- Dodaj odpowiednie `await` dla asynchronicznych operacji
- Użyj `page.waitForSelector()` zamiast `page.click()` od razu
- Sprawdź timeouts w konfiguracji

### MSW nie działa
- Sprawdź czy `server.listen()` jest wywołane w `beforeAll`
- Zweryfikuj endpointy w `src/test/msw.ts` 
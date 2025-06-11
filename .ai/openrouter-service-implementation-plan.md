# Plan implementacji usługi OpenRouter

## 1. Opis usługi
Usługa `OpenRouterService` to warstwa pośrednicząca między aplikacją a API OpenRouter. Udostępnia metody do wysyłania czatów opartych na LLM z precyzyjną kontrolą nad:
- komunikatami systemowymi i użytkownika,
- strukturą odpowiedzi (response_format),
- wyborem modelu i jego parametrami.

Zaimplementowana w TypeScript, ma działać w środowisku Astro (+ React), korzystając z Fetch API oraz weryfikując odpowiedzi przy użyciu bibliotek do walidacji schematu (np. Zod).

---

## 2. Opis konstruktora
```ts
interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;            // domyślnie https://openrouter.ai
  defaultModel: string;        // np. "gpt-4o-mini"
  defaultParams?: Record<string, any>; // np. { temperature: 0.7, max_tokens: 1024 }
}

class OpenRouterService {
  constructor(private config: OpenRouterConfig) { ... }
}
```
- Ładuje `apiKey` z `import.meta.env.OPENROUTER_API_KEY` lub z argumentu.
- Ustala `baseUrl`, `defaultModel` i domyślne `params`.
- Przygotowuje nagłówki HTTP z autoryzacją.

---

## 3. Publiczne metody i pola

### sendChat(
  messages: Array<{ role: 'system' | 'user'; content: string }> ,
  options?: {
    model?: string;
    params?: Record<string, any>;
    responseFormat?: {
      type: 'json_schema';
      json_schema: {
        name: string;
        strict: boolean;
        schema: Record<string, any>;
      }
    };
  }
): Promise<any>

- Buduje payload: 
  ```json
  {
    model: options.model ?? this.config.defaultModel,
    messages: [ ... ],
    response_format: options.responseFormat,
    ...options.params ?? this.config.defaultParams
  }
  ```
- Wysyła `POST` na `${baseUrl}/v1/chat/completions`.
- Zwraca zparsowaną odpowiedź.

**Przykład użycia:**
```ts
const svc = new OpenRouterService({ apiKey, defaultModel: 'gpt-4o-mini' });

const response = await svc.sendChat(
  [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user',   content: 'Podaj listę 3 miast w Polsce.' }
  ],
  {
    params: { temperature: 0.3 },
    responseFormat: {
      type: 'json_schema',
      json_schema: {
        name: 'CityListSchema',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            cities: { type: 'array', items: { type: 'string' } }
          },
          required: ['cities']
        }
      }
    }
  }
);
```

---

## 4. Prywatne metody i pola

- `_buildHeaders()`: przygotowuje nagłówki `Authorization: Bearer ${apiKey}` i `Content-Type: application/json`.
- `_validateResponse(data)`: waliduje strukturę odpowiedzi za pomocą zdefiniowanego schematu (Zod lub własny parser JSON Schema).
- `_handleError(error)`: klaryfikuje błąd i rzuca dedykowanym wyjątkiem.
- `_retryWithBackoff(fn)`: opcjonalne podejście do ponawiania żądań przy błędach transientnych.

---

## 5. Obsługa błędów

1. Błąd sieci (np. brak internetu)  
   _Rozwiązanie:_ retry z backoff, informacja użytkownikowi o problemie.
2. Nieprawidłowy lub brakujący `apiKey`  
   _Rozwiązanie:_ od razu rzucić `ConfigurationError`.
3. Odpowiedź 4xx od OpenRouter (np. 401, 403, 429)  
   _Rozwiązanie:_ dedykowane wyjątki `AuthenticationError`, `RateLimitError`.
4. Timeout połączenia  
   _Rozwiązanie:_ ponawiać do N razy, potem `TimeoutError`.
5. Niepoprawny format JSON w odpowiedzi  
   _Rozwiązanie:_ `ResponseFormatError`, log szczegółów i schematu.
6. Walidacja schematu JSON nieudana  
   _Rozwiązanie:_ `SchemaValidationError`, do debugowania struktury.

---

## 6. Kwestie bezpieczeństwa

- Przechowywać `apiKey` wyłącznie w zmiennych środowiskowych, NIE w repozytorium.
- Używać HTTPS do wszystkich połączeń.
- Ograniczyć logowanie: nie wypisywać pełnych treści czatów.
- Walidować dane wejściowe (np. długość `content`).
- Stosować CORS i zabezpieczenia w warstwie Astro/API.
- Ochrona przed nadużyciami: limit zapytań po stronie serwera.

---

## 7. Plan wdrożenia krok po kroku

1. **Instalacja zależności**  
   ```bash
   npm install zod
   ```
2. **Utwórz plik usługi** w `src/lib/services/OpenRouterService.ts`.
3. **Zaimplementuj `OpenRouterConfig` i konstruktor`.**
4. **Dodaj prywatne metody:** `_buildHeaders`, `_handleError`, `_validateResponse` (Zod).
5. **Zaimplementuj `sendChat`** zgodnie z dokumentacją OpenRouter API.
6. **Dodaj retry/backoff** dla transientnych błędów.
7. **Zdefiniuj JSON Schemas** w `src/lib/schemas/` i importuj do `responseFormat`.
8. **Utwórz testy jednostkowe** (Jest/Vitest) dla:
   - poprawnej obsługi success oraz różnych błędów,
   - walidacji schematu.
9. **Skonfiguruj środowisko**  
   - Dodaj `.env` z `PUBLIC_OPENROUTER_API_KEY`.
   - Upewnij się, że `import.meta.env` jest dostępne.
10. **Zintegruj w API Astro** w `src/pages/api/chat.ts`:
    ```ts
    import { OpenRouterService } from 'src/lib/services/OpenRouterService';
    export async function post({ request }) {
      const { messages } = await request.json();
      const svc = new OpenRouterService({ apiKey: import.meta.env.PUBLIC_OPENROUTER_API_KEY, defaultModel: 'gpt-4o-mini' });
      const result = await svc.sendChat(messages, { /* opcje */ });
      return new Response(JSON.stringify(result), { status: 200 });
    }
    ```
11. **Test end-to-end**: wysyłanie żądania z frontendu, walidacja odpowiedzi.
12. **Przegląd bezpieczeństwa** i optymalizacja limitów.
13. **Deploy**: GitHub Actions -> DigitalOcean Docker.

---

*Gotowe!* Masz szczegółowy plan implementacji usługi OpenRouter dostosowany do Astro/TS/React/Tailwind/Shadcn/ui. 
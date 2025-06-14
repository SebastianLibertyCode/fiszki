Frontend - Astro z React dla komponentów interaktywnych:

- Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
- React 19 zapewni interaktywność tam, gdzie jest potrzebna
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI

Backend - Supabase jako kompleksowe rozwiązanie backendowe:

- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników

AI - Komunikacja z modelami przez usługę Openrouter.ai:

- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

Testing - Kompleksowy stack testowy zapewniający jakość i stabilność:

- Vitest jako szybki framework do testów jednostkowych i integracyjnych w TypeScript
- React Testing Library do testowania komponentów React z fokusem na zachowania użytkownika
- Playwright do testów end-to-end z obsługą wszystkich głównych przeglądarek
- MSW (Mock Service Worker) do mockowania API i usług zewnętrznych w testach
- Storybook + Chromatic do tworzenia, testowania i dokumentacji komponentów UI
- Axe-core + Lighthouse do audytów dostępności i wydajności
- k6 do testów wydajnościowych API
- Pact do testów kontraktowych zapewniających zgodność API
- @testing-library/user-event do symulacji interakcji użytkownika

CI/CD i Hosting:

- Github Actions do tworzenia pipeline'ów CI/CD z automatycznym uruchamianiem testów
- DigitalOcean do hostowania aplikacji za pośrednictwem obrazu docker

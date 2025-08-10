# Środowisko Docker dla HVAC CRM + Motia

## Szybki start

```bash
# Linux/macOS
./scripts/dev-up.sh

# Windows PowerShell
.\scripts\dev-up.ps1
```

Aplikacja będzie dostępna na: http://localhost:5173

## Architektura

- **Frontend** (port 5173): React + Vite + tldraw + Motia framework
- **Research Proxy** (port 8787): Node.js proxy dla API badawczych (Tavily, Exa, Firecrawl)
- **Convex Mock** (port 3001): Mock serwera Convex dla persistence
- **Raynet Adapter** (port 8000): Python FastAPI adapter dla Raynet CRM

## Konfiguracja

1. Skopiuj `.env.example` do `.env`
2. Uzupełnij klucze API (opcjonalnie):
   ```
   TAVILY_API_KEY=your_key_here
   EXA_API_KEY=your_key_here
   FIRECRAWL_API_KEY=your_key_here
   RAYNET_API_KEY=your_key_here
   ```

## Komendy

```bash
# Uruchom środowisko
./scripts/dev-up.sh

# Sprawdź status
./scripts/dev-status.sh

# Pokaż logi
./scripts/dev-logs.sh all
./scripts/dev-logs.sh frontend

# Test integracji
./scripts/dev-test.sh

# Zatrzymaj
./scripts/dev-down.sh

# Reset (rebuild)
./scripts/dev-reset.sh
```

## Bezpieczeństwo

- Klucze API są przechowywane tylko w kontenerach backend (research-proxy, raynet-adapter)
- Frontend komunikuje się z proxy, nie bezpośrednio z zewnętrznymi API
- Wszystkie usługi działają w izolowanej sieci Docker

## Rozwój

### Dodawanie nowych endpointów research

Edytuj `services/research-proxy/server.js`:

```javascript
app.post('/api/research/new-provider', async (req, res) => {
  // implementacja
})
```

### Rozszerzanie Convex mock

Edytuj `services/convex-mock/server.js` dla nowych endpointów persistence.

### Integracja z Raynet

Uzupełnij `services/raynet-adapter/server.py` o rzeczywiste wywołania API Raynet.

## Troubleshooting

1. **Kontenery nie startują**: `./scripts/dev-reset.sh`
2. **Błędy sieci**: Sprawdź czy porty 5173, 8787, 3001, 8000 są wolne
3. **Problemy z research**: Sprawdź klucze API w `.env`
4. **Logi**: `./scripts/dev-logs.sh all`

## Produkcja

W produkcji zastąp:
- `convex-mock` → prawdziwy Convex deployment
- `research-proxy` → serwer z rate limiting i auth
- `raynet-adapter` → pełna integracja z Raynet CRM
- Dodaj HTTPS, monitoring, backup

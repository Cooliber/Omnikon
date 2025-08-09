---
title: Motia workflow canvas
component: ./MotiaCanvasExample.tsx
category: use-cases
priority: 0
keywords: [motia, quantum, workflow, cognition, nodes, shadcn, research]
---

Interaktywny kanban/diagram przepływu Motia oparty na tldraw z 9-fazowym cyklem poznawczym. Pokazuje: placeable węzły faz, rejestr komponentów, tacę drag&drop, oraz integracje narzędzi badawczych (grep, Tavily, Exa, Firecrawl) przez warstwę usług.


Bezpieczeństwo
- W produkcji preferuj proxy serwerowe dla dostawców badań (Tavily/Exa/Firecrawl/Grep), aby nie ujawniać kluczy API w przeglądarce.
- Opcjonalnie ustaw VITE_RESEARCH_PROXY_BASE (np. "/api/research"), a klient będzie wywoływał odpowiednio: /tavily, /exa, /firecrawl, /grep.

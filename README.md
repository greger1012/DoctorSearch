# DoctorSearch

AI-assisted unified search for finding doctors, locations, and health content from a single natural-language prompt. Built as a full-stack demo with React, Node/Express, and Elasticsearch.

## Highlights

- **Unified search** — one query box across doctors, facilities, and content
- **Natural-language queries** — e.g. “cardiologists accepting new patients”
- **Elasticsearch backend** — filtering, aggregations, and result highlighting
- **Optional LLM summaries** — Groq / OpenAI / Hugging Face when an API key is configured
- **Local-first setup** — run on your machine with Docker + Node (no cloud required)

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React 18, Styled Components |
| Backend | Node.js, Express |
| Search | Elasticsearch 8.11 (+ Kibana) |
| AI (optional) | Groq / OpenAI / Hugging Face |
| Data | CSV doctor import + disease/condition datasets |

## Quick start

**Prerequisites:** [Node.js 16+](https://nodejs.org/), [Docker Desktop](https://www.docker.com/products/docker-desktop)

```bash
git clone https://github.com/greger1012/DoctorSearch.git
cd DoctorSearch

# Install dependencies
npm run setup

# Terminal 1 — start Elasticsearch
npm run elasticsearch
# wait ~30s for Elasticsearch to become ready

# Terminal 2 — create indices and import data
npm run startup
npm run import:excel
npm run import:locations

# Start frontend + API
npm run dev
```

App URLs after startup:

| Service | URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| Elasticsearch | http://localhost:9200 |
| Kibana | http://localhost:5601 |

After the first setup, day-to-day use is:

```bash
npm run elasticsearch   # terminal 1
npm run dev             # terminal 2
```

Step-by-step notes and troubleshooting: [SIMPLE_SETUP.md](./SIMPLE_SETUP.md) · [DOCKER_BIOS_SETUP.md](./DOCKER_BIOS_SETUP.md)

### Optional AI summaries

```bash
cp server/config.env.example server/config.env
# add your own Groq (or other) API key
```

Without a key, the app still runs using template-based summaries.

## Example queries

- “Neurologists who see new patients”
- “Cardiologists accepting new patients”
- “Emergency care Mission Bay”
- “Parkinson’s disease specialists”
- “Pediatric specialists”

## Project structure

```
DoctorSearch/
├── client/                 # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       └── styles/
├── server/                 # Express API
│   ├── routes/
│   ├── services/
│   └── scripts/            # index setup + data import
├── docker-compose.yml      # Elasticsearch + Kibana
└── doctorsdata.CSV         # doctor dataset used by import scripts
```

## API overview

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/search` | Unified search |
| `GET` | `/api/search/suggest/:query` | Autocomplete suggestions |
| `GET` | `/api/doctors` | List / filter doctors |
| `GET` | `/api/doctors/:id` | Doctor detail |
| `GET` | `/api/locations` | List / filter locations |
| `GET` | `/api/locations/:id` | Location detail |

Elasticsearch indices: `doctors`, `locations`, `content`.

## Data notes

- Real doctor rows come from `doctorsdata.CSV` (import via the scripts above).
- Large disease/condition datasets ship with the repo for search content.
- `npm run seed:fake` generates test-only fake data — do not use for demos meant to look production-like.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Railway, Render, and other options. Additional ops notes live in the root `RAILWAY_*.md` guides.

## Author

**Gregory Dorfman** ([greger1012](https://github.com/greger1012))

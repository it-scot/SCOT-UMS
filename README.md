# SCOT Campus Enterprise ERP

Monorepo for the SCOT Campus ERP: a React (TanStack Start) frontend and a Spring Boot API.

## Layout

- `frontend/` — campus UI (Employee, HR, Admin & Logistics, IT Helpdesk)
- `backend/` — Spring Boot 4.1 REST API (Java 21, Maven, PostgreSQL)
- `.cursorrules` — shared UI design tokens for frontend work
- `docker-compose.yml` — local PostgreSQL, plus optional app containers

## Local development

Start PostgreSQL:

```sh
docker compose up -d postgres
```

Frontend:

```sh
cd frontend
npm install
npm run dev
```

The UI runs at [http://localhost:3000](http://localhost:3000). Unauthenticated visits redirect to `/login`. Use the four Quick Dev Login buttons (IT Admin, System Admin, HR Officer, Employee) to store a mock JWT in `localStorage` and open that role’s dashboard. Google Workspace OAuth is not wired yet.

`Ctrl+K` opens global search. Seed data is used until `VITE_USE_API=true` and `VITE_API_BASE_URL` point at the API.

Backend (run from `backend/`, not the repo root):

```sh
cd backend
./mvnw spring-boot:run
```

On Windows use `mvnw.cmd`. The API listens on [http://localhost:8080](http://localhost:8080) and connects to `jdbc:postgresql://localhost:5432/scot_erp_db` as `scot` / `scot`.

Optional: `docker compose --profile apps up --build` starts PostgreSQL, the API, and the UI together.

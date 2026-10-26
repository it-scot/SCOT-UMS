# SCOT Campus ERP Frontend

React UI for the SCOT Campus Enterprise ERP. The four working modules are Employee Dashboard, HR Dashboard, Admin & Logistics, and IT Helpdesk.

## Development

From this directory:

```sh
npm install
npm run dev
```

The app runs on [http://localhost:3000](http://localhost:3000). `Ctrl+K` opens global search.

Seed data is used until the Spring Boot API is available. Copy `.env.example` to `.env` and set `VITE_USE_API=true` when `VITE_API_BASE_URL` is reachable.

## Layout

- `src/routes` — TanStack Start file routes. Keep these thin.
- `src/pages` — module screens.
- `src/components/layout` — sidebar, header, search, notifications.
- `src/components/erp` — shared campus UI.
- `src/hooks`, `src/types`, `src/utils` — data access and helpers.

# SCOT Campus ERP API

Spring Boot 4.1 service for the campus ERP. Java 21, Maven, PostgreSQL, and Google Workspace OAuth (`@scot.lk`).

## Run

```sh
docker compose -f ../docker-compose.yml up -d postgres
./mvnw spring-boot:run
```

Health check: `GET http://localhost:8080/api/health`

Google sign-in starts at `/oauth2/authorization/google`. After a successful `@scot.lk` login the API issues a JWT cookie and redirects to the frontend origin.

## Packages

- `controller` — REST endpoints
- `service` — business rules, JWT issuance, Workspace domain checks
- `repository` — Spring Data JPA
- `entity` — persistence models
- `config` — security, CORS, JPA auditing, OAuth/JWT filters

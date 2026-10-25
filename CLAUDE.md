# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

`healthbridge-api` is the backend for the HealthBridge EMR (multi-tenant: one `Organization` per hospital). Package manager is **yarn**.

- `src/shared/entity.interface.ts` is the **data spec** for domain entities (its fields are snake_case, but DB columns use the entities' camelCase property names). `prd/entities.md` lists the wider set of planned entities.
- **Read `prd/` before implementing a feature.** It holds per-feature business and product rules (e.g. `prd/service.md`: system-generated services, per-branch price and status). When a PRD file covers the feature, it overrides the data spec. Don't invent business rules such as uniqueness when the PRD or spec doesn't state them; ask instead.
- Implemented so far: `user`, `auth`, `profile`, `app-notification(-recipient)`, plus support modules `event-manager`, `cache`, `otp`, `mail`, `storage`. Domain entities (patient, card, encounter, …) are not built yet.

## Commands

```bash
docker compose up -d --wait   # Postgres 18 (host port 5433), Redis 8 (6379), Mailpit (SMTP 1025, inbox http://localhost:8025); settings from .env (see .env.example)
docker compose down           # add -v to wipe the data volumes

yarn install
yarn start:dev          # watch mode; listens on $PORT or 3000
yarn build              # nest build -> dist/ (uses tsconfig.build.json, excludes specs and test/)
yarn start:prod         # node dist/main

yarn lint               # oxlint --type-aware (not ESLint)
yarn format             # prettier on src/ and test/

yarn migration:generate <name>  # diff entities vs DB -> src/database/migrations/<ts>-<name>.ts (kebab-case)
yarn migration:status           # list migrations, [X] = applied
yarn migration:run              # apply pending migrations (ts-node)
yarn migration:revert           # undo the last applied migration
yarn migration:run:prod         # apply from dist/ after yarn build (no ts-node)

yarn test               # unit tests (*.spec.ts)
yarn test:e2e           # e2e tests (test/*.e2e-spec.ts, config in test/jest-e2e.json)
yarn test:cov

# single test file / single test
yarn test src/app.controller.spec.ts
yarn test -t "should return"
```

Jest scripts run through `node --experimental-vm-modules`, so always invoke tests via the yarn scripts rather than calling `jest` directly.

## Architecture & conventions

Code style comes from the team's other Nest projects; follow it for new features.

- **One folder per component** in `src/components/<name>/` with files named `<name>.entity.ts`, `.enum.ts`, `.event.ts`, `.interface.ts` (service inputs and `…Query`/`…Filter` types), `.dto.ts` (class-validator request bodies), `.module.ts`, `.service.ts`, `.controller.ts`. Controllers take DTOs and pass plain objects to services; services own the repository.
- Routes are versioned: `@Controller('v1/<resource>')`. Use `@Req() req: ExtendedExpressRequest` for `req.user` / `req.pagination`, and import that type with `import type` (required by `isolatedModules` + `emitDecoratorMetadata`).
- **Auth is on by default**: `AuthGuard` is the global `APP_GUARD`; mark open routes with `@Public()` (`src/shared/utils/decorators.ts`). Access token via `Authorization: Bearer` or the `token` cookie; the refresh token (`refreshToken` cookie) is signed with a separate secret. Emails are unique only per organization, so sign-in and password reset take the organization's `clientId` plus `email` (`AuthService.findUserInOrganization`); OTPs are keyed by user ID. Password hashing lives in `src/shared/utils/password.ts`, not `AuthService`, so other services can hash without depending on auth.
- **Users are global**, not tenant-scoped (`users` = email, password, type `staff|patient`). There is no user self sign-up: `POST /v1/organizations` creates an organization plus its `admin` user (temporary password emailed, `passwordResetRequired` set). Tenant-owned tables carry `organizationId`.
- **Entities**: camelCase properties, `@Entity({ name: '<snake_plural>' })`, `timestamptz` dates. Column names are the camelCase property names as-is (no naming strategy); only table names are snake_case. Explicit `@JoinColumn({ name })` values must be camelCase too (e.g. `userId`). `User.password` is `select: false`; use `UserService.findOneWithPasswordIncluded` when you need it.
- Schema: **migrations only**, `synchronize` is off everywhere. Options live in `src/database/database.config.ts` (shared by the app and the CLI); `src/database/data-source.ts` is the CLI entry point (loads `.env` itself; don't import it from the app). Migrations are in `src/database/migrations/`. After changing an entity, run `yarn migration:generate <kebab-name>` (files are `<timestamp>-<kebab-name>.ts`, e.g. `1792257823300-create-users-table.ts`), review the file, then `yarn migration:run`.
- Paginated list endpoints use `@UseInterceptors(PaginationInterceptor)` and return `PaginatedResult<T>` (`{ page, limit, total, records }`).
- Services publish changes through `EventManagerService.emit(...)` (currently a no-op placeholder).
- Emails are queued on BullMQ (`MAIL` queue, `MailWorker`) and rendered from Handlebars templates in `components/mail/templates/`. `nest-cli.json` copies `*.hbs` into `dist/`.

Gotchas:
- TypeORM 1.x **throws** on `undefined` values in a `where` object. Strip unset filter fields before querying (see `AppNotificationRecipientService.toWhere`).
- Express 5 re-parses `req.query` on every access, so `delete req.query.x` does nothing; replace the property instead (see `PaginationInterceptor`).
- Global `ValidationPipe` uses `forbidNonWhitelisted`, so any query/body field not declared on the DTO is rejected with 400.
- Don't read `process.env` at module top level: `.env` is loaded by `ConfigModule` after imports run. Read it inside constructors, factories or functions.

## Installed stack

Config `@nestjs/config` · DB `@nestjs/typeorm` + `typeorm` 1.x + `pg` · Redis `ioredis` · queues `@nestjs/bullmq` + `bullmq` · auth `@nestjs/jwt` + `@nestjs/passport` + `passport-jwt`, `bcrypt` · IDs `uuidv7`, `nanoid`, `randomstring` · uploads via multer (bundled in `@nestjs/platform-express`, types in `@types/multer`) · realtime `@nestjs/websockets` + `@nestjs/platform-socket.io` + `@socket.io/redis-adapter` · security `helmet`, `@nestjs/throttler`, `class-validator`/`class-transformer`, `cookie-parser`.

- `nanoid` is pinned to v3 on purpose: v5 is ESM-only and fails to load under Jest in this project.
- NestJS 12 packages are ESM. Jest can only load them on Node ≥ 24.9 (native `require(esm)`), so tests fail on Node 22 with "Must use import to load ES Module".

## Tooling notes

- TypeScript 6 with `module`/`moduleResolution: nodenext`, `strict: true` (but `strictPropertyInitialization: false`), decorators + `emitDecoratorMetadata` enabled (required for Nest DI).
- Linting is **oxlint** (`.oxlintrc.json`): `no-floating-promises` is an error — every promise must be awaited or explicitly `void`ed (see `void bootstrap()` in `src/main.ts`). `no-explicit-any` is off.
- Prettier: single quotes, trailing commas.
- `jest.config.ts` reads `compilerOptions.paths` from `tsconfig.json` and maps them automatically, so path aliases only need to be added to `tsconfig.json`. Coverage also includes `libs/` and `apps/` for a future Nest monorepo layout. Note `test/jest-e2e.json` does **not** get these path mappings — add a `moduleNameMapper` there if aliases are introduced.
- Use the Nest CLI schematics (`npx nest g module|controller|service <name>`) to scaffold new features so they're wired into modules consistently.

## Repo hygiene

`.env` holds local secrets, but `.gitignore` is still empty and nothing has been committed yet. Before the first commit, `.gitignore` should cover at least `node_modules/`, `dist/`, `coverage/`, and `.env`.

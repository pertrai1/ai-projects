## 1. Initialize Next.js Project

- [x] 1.1 Run `create-next-app` with TypeScript, App Router, Tailwind CSS, and `src/` directory enabled
- [x] 1.2 Verify `tsconfig.json` has `strict: true`
- [x] 1.3 Verify the project builds with `npm run build` and runs with `npm run dev`

## 2. Configure Linting and Formatting

- [x] 2.1 Install Prettier and create `.prettierrc` config file
- [x] 2.2 Add `format` and `format:check` scripts to `package.json`
- [x] 2.3 Verify `npm run lint` passes with zero errors on the clean project
- [x] 2.4 Verify `npm run format:check` passes on the clean project

## 3. Set Up Vitest

- [x] 3.1 Install Vitest and create `vitest.config.ts`
- [x] 3.2 Add `test` script to `package.json` pointing to Vitest
- [x] 3.3 Create `tests/health.test.ts` smoke test (`expect(true).toBe(true)`)
- [x] 3.4 Verify `npm test` runs and passes

## 4. Set Up Prisma and PostgreSQL

- [x] 4.1 Install Prisma and `@prisma/client`
- [x] 4.2 Run `npx prisma init` to create `prisma/schema.prisma` with PostgreSQL provider
- [x] 4.3 Verify schema has no models (only datasource and generator config)
- [x] 4.4 Create `src/lib/prisma.ts` with singleton client pattern using `globalThis` caching
- [x] 4.5 Verify `npx prisma validate` passes

## 5. Environment Variables

- [x] 5.1 Create `.env.example` with `DATABASE_URL` and comments explaining each variable
- [x] 5.2 Verify `.env` is in `.gitignore`

## 6. Health-Check Endpoint and Home Page

- [x] 6.1 Create `src/app/api/health/route.ts` returning `{ "status": "ok" }` with 200
- [x] 6.2 Update `src/app/page.tsx` to display "Bookmark Manager" and a running status message
- [x] 6.3 Add a test in `tests/health.test.ts` that validates the health endpoint returns `{ status: "ok" }`


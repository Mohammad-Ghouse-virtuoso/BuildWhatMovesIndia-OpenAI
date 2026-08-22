# Civic Intelligence

A synthetic hackathon prototype for a clearer Andhra Pradesh municipal grievance
journey and a civic-intelligence layer. It is not connected to any government
system.

## Local setup

1. Use a supported Node.js release (`20.19`, `22.12`, or newer supported majors).
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add a Neon `DATABASE_URL`.
4. Run `npm run dev`.

OpenAI is optional. Set both `OPENAI_API_KEY` and `OPENAI_MODEL` to enable the
later AI integration; otherwise the application is designed to use deterministic
fallbacks.

## Checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Database

`DATABASE_URL` is the pooled Neon runtime connection. If migrations need a direct
connection, set `DIRECT_URL`; Prisma migration commands prefer it automatically.

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:migrate:deploy
npm run seed
```

## Agent implementation notes

`.internal/` is gitignored. After finishing a phase, write a handoff file for the next agent:

`.internal/implementation-notes/Phase-<N>-implemented.md`

Include:

- What shipped and what did not
- Exact import paths, adapters, and ownership
- Commands run and verification results
- Known limitations and blockers

Read existing files in that folder before starting the next phase. Phase 0 is already documented there.

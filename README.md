# Ask India

**Turn questions into evidence.**

A synthetic citizen prototype for India’s RTI Online journey (Central public
authorities only). You start with a question; the product helps you turn it into
a precise records request, mock-file it, track it, and understand the response.

This is not a government website. It does not file with RTI Online. All data is
synthetic.

## Local setup

1. Use a supported Node.js release (`20.19`, `22.12`, or newer supported majors).
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add a Neon `DATABASE_URL`.
4. Run `npm run dev`.

OpenAI is optional. Set both `OPENAI_API_KEY` and `OPENAI_MODEL` for later
language help; the app must still work with deterministic fallbacks.

## Checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Database

`DATABASE_URL` is the pooled Neon runtime connection. If migrations need a direct
connection, set `DIRECT_URL`.

```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

Phase 1 owns models and the `DEMO/RTI/2026/004281` seed.

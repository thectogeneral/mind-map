# MindMap

A route-map questionnaire that gathers what you are drawn to (not a problem), branches by region and corner, then finds product ideas from your answers, plans a test for each, and writes a build prompt.

- 12 regions, 12 corners each, 946 questions, about 11,900 options. Every closed question has 10+ options plus an "Other" box.
- Questions and options change with earlier answers (`when` and `adds` in `src/content`).
- Two finders: **rule-based** (instant, no key, repeatable) or **AI** (Claude, needs a key).
- Build prompt per idea: **template** (fills in your answers) or **AI-written**.
- Export the report as Markdown (copy or download) or PDF.

## Run

```bash
npm install
npm run dev          # http://localhost:3000
```

AI mode: set `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`) in `.env.local`, or paste a key on the finder screen (sent with the request, never stored).

## Check

```bash
npm run validate     # every question has 10+ options, branching conditions point at real options
npm run test         # route, rule engine, evidence cap, crossover
npm run build
```

## Layout

- `src/content/` question data (`lib.ts` helpers, one file per two regions, `shared.ts` for the start, crossover and reality check)
- `src/lib/engine.ts` route and branching, `rules.ts` rule-based finder, `ai.ts` AI finder, `prompt.ts` build prompts, `report.ts` and `export.ts` Markdown and PDF
- `src/components/` UI in the BuildWithSalem design language
- `src/app/api/ai/route.ts` server proxy to the Anthropic API

# MindMap

A route-map questionnaire that gathers what you are drawn to (not a problem), branches by region and corner, then finds product ideas from your answers, plans a test for each, and writes a build prompt.

- 18 regions, 12 corners each, 2,276 questions, about 28,500 options. Every closed question has 10+ options plus an "Other" box.
- **Depth:** Quick, Standard or Deep. A typical route is about 64, 76 or 89 questions. Standard and Deep add questions such as the first session, what it needs from outside, and what users must trust. "Go deeper" on the Review screen adds more without losing answers.
- Questions and options change with earlier answers: `when` shows a question only if, `adds` appends options, `drops` removes options that do not fit (for example a $0 budget hides paid-vendor options). Later questions can react to what you picked in your corner.
- **Randomize** fills a whole route at random and shows ideas in one click. **Randomize the rest** keeps your answers (after 5) and fills the others. The results show every answer chosen.
- **Map** draws every path: all regions, each region's corners and stops, and the branch rules, with your own route highlighted.
- Two finders: **rule-based** (instant, no key, repeatable) or **AI** (Claude, needs a key).
- Prompts per idea, each as a **template** or **AI-written**: build, explainer, UI design and refine. One route-wide **ideas and refinement** prompt generates and refines ideas, names the problems they solve and suggests better answers.
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
npm run validate -- --strict   # also requires every region to be fully extended (7 questions per corner)
npm run test         # route, depth, drops, randomize, map, prompts, rule engine, crossover
npm run build
```

## Layout

- `src/content/` question data (`lib.ts` helpers, one file per one or two regions, `shared.ts` for the start, crossover and reality check)
- `src/lib/engine.ts` route and branching, `rules.ts` rule-based finder, `ai.ts` AI finder, `prompt.ts` prompts, `map.ts` map data, `report.ts` and `export.ts` Markdown and PDF
- `src/components/` UI in the BuildWithSalem design language
- `src/app/api/ai/route.ts` server proxy to the Anthropic API

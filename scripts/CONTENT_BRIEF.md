# Content brief: writing a region (domain) for the MindMap

The product is a "map" questionnaire. A person picks a region (domain), then a corner (sub-area), and the questions that follow narrow in on a specific product shape. The person does NOT have a problem in mind; the questions only gather information about what they are drawn to, who they could serve, how it would work and what features it would have. NEVER ask about pain points or "what problem do you solve". Questions describe the product space, not a problem to be confessed.

## Files and helpers
Write `src/content/<file>.ts`. Import helpers from `./lib` (`domain`, `B`, `Q`). Read `src/content/lib.ts` first. Default-export an ARRAY of domains: `export default [games, devtools];`.
Reference for the older, thinner version of Games, Developer tools and Education: `content-v1/content.js` (same helper style, plain JS). Reuse its best options but the new standard is deeper (below).

## Structure of one domain (see lib.ts `domain()`)
- `forkText` question + exactly 12 corners via `B(prefix, i, 'Corner name', a, b, c, d)`.
- Each corner has FOUR questions, each a tuple `[questionText, 'opt1|opt2|...', extra?]`:
  - a (key corner_a, pick up to 2): what the user does moment to moment, specific to THIS corner.
  - b (corner_b, up to 3): what brings them back or makes the value compound.
  - c (features, up to 6): the concrete FEATURES this kind of app could have (a feature menu: 14 to 18 options). People will pick several. Make them specific, buildable features, named plainly ("Weekly digest email", "Offline mode", "Shared household budget"), not abstractions.
  - d (angle, up to 2): what could make it specific/different (a niche twist, constraint or unfair advantage).
  Corner questions must read differently per corner. A person in "Puzzle games" must never see wording that fits another corner. Do not reuse the same options across corners except where genuinely natural.
- Districts (all arrays of `Q(...)`), written for the whole domain:
  - peopleQs (min 5): keys must include `audience` (who, max 2) and `moment` (when they reach for it, max 2); add things like device, context, language, group size.
  - shapeQs (min 5): keys must include `platform` (where it runs, max 2) and `ai` (what role AI could play, max 2); add session length, social shape, content/data source, interface style.
  - systemQs (min 4): the invisible features: accounts and data, notifications and reminders, integrations and imports, admin/analytics, offline/performance, trust and safety. Tailor to the domain.
  - growthQs (min 4): keys must include `money` (how it earns, max 2), `first_users` (how the first 100 find it, max 2) and `loop` (what makes users bring others, max 1); plus a pricing or distribution question.
  - edgeQs (min 3): keys `belief` (what you believe that most builders do not), `kill` (outside condition that would sink it), `prior` (why earlier products like this faded). Also useful: a `bench` question (closest existing product format).
- Question ids: `<prefix>.sub` for the fork (auto), `<prefix>.b<i>.a|b|c|d` for corners (auto via B), and for districts `<prefix>.who`, `<prefix>.when`, etc. Unique across the file. Use the prefix given to you.

## Branching rules (important: this is what makes it a map)
- Use `extra` (3rd tuple item for corner questions, 5th arg of `Q` for district questions) as `{ when: {id, has:[...]} }` to show a question ONLY when an earlier answer included one of the listed options, and `{ adds: [{id, has:[...], o:[...]}] }` to append more options when an earlier answer included one of `has`. `id` must be an EARLIER question in the same domain (the fork `<prefix>.sub`, an earlier district question) or a shared one: `y.skill y.stack y.hours y.budget y.team y.ambition y.time y.assets y.market r.pull`. In district questions you can reference the fork id (`<prefix>.sub`) and earlier district questions (order is people, shape, system, growth, edge). Corner questions can only reference shared ids and the fork.
- Each domain needs AT LEAST 8 district questions using `when` or `adds` (the validator requires 4). Good examples: shape `platform` gets extra options when the fork picked a certain corner; a `WhatsApp bot` platform answer opens a system question about messaging limits; a `Rewarded ads` money answer opens an ad-network question; a `Schools` audience opens a question about teacher dashboards; high `y.budget` or `y.team` unlock heavier platform options. Use the exact option text of the earlier question in `has`.
- Options in `adds` must not duplicate the base options. A `when` question's text can mention the context ("You picked WhatsApp. What can the bot do?") only if it makes sense whenever shown.

## Quality rules
- Every closed question: 10 to 18 options (features questions 14 to 18). Option text short (under 60 characters, ideally 2 to 6 words), concrete, mutually distinct, in plain English. No option may be "Other" (the app adds an Other box). No duplicates. Question text ends with `?`.
- Specific to the domain's real world. Where relevant keep the builder's context in mind: many builders are in Nigeria, Uganda, Kenya or the wider African market and use mobile-first, low-bandwidth, mobile-money (M-Pesa, MTN MoMo, Flutterwave, Paystack, Opay) contexts, but options must work worldwide too; mix local and global.
- No emoji. No em dashes or en dashes anywhere (use commas, colons or hyphens). 
- Never ask the person to describe a pain point. Neutral phrasing: "What does the user do", "What would it include", "Who is it for".
- Do not use the words "problem" or "pain" in question text.

## Validate before finishing
Run from the project root: `npx tsx scripts/validate.ts src/content/<file>.ts`. Fix every error until it prints `ok:`. Then reply with only: the file path, the validator's ok line, and one sentence. Do not touch other files.

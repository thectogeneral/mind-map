# READ FIRST: version 2 rules (they override anything below that conflicts)

The map now has a **depth setting** (quick, standard, deep) and two new rule types. Every region is being extended so each corner has seven questions and each region has more conditional district questions. Quick keeps only the core questions, so core content must stay exactly as it is.

## What changes in each corner
`B(prefix, i, name, a, b, c, d, e, f, g)` takes three more optional tuples after `d`. They get their ids and depth automatically (`<prefix>.b<i>.e`, `.f`, `.g`):
- **e** (key `corner_e`, pick up to 2, shown at standard depth and deeper): "What does the first session look like?" The first thing they see, the first action, the first reward, specific to THIS corner. 10 to 14 options.
- **f** (key `corner_f`, pick up to 3, deep only): "What would it need from outside?" Content, data, partners, licences, hardware, people or services. 12 to 16 options.
- **g** (key `corner_g`, pick up to 2, deep only): "What must users be able to trust, or which rules apply?" Privacy, safety, accuracy, money handling, moderation, local regulation. 10 to 14 options.
Each of e, f and g MUST narrow on earlier answers: give it an `Extra` (third tuple item) with `adds`, `when` or `drops` whose `id` is an earlier question in the SAME corner (`<prefix>.b<i>.a`, `.b`, `.c`, `.d`, or `.e` for f and g), or the fork (`<prefix>.sub`), or a shared id (`y.skill y.stack y.hours y.budget y.team y.ambition y.time y.assets y.market r.pull`). `has` must be exact option text of that earlier question (including options it gains through its own `adds`). The validator rejects corner questions with no condition.
Example tuple: `['What does the first session look like?', 'Opens on a puzzle already in play|...', { adds: [{ id: 'g.b1.a', has: ['Match tiles in a grid'], o: ['Tiles already half matched', 'A guided first match', 'One free hint shown at once'] }] }]`
Existing corners already have a, b, c and d: do not change them (people's saved answers refer to their ids and option text). Only append the e, f and g tuples to each `B(...)` call.

## `drops`: hide options that do not fit earlier answers
`Extra` and `Q(...)` accept `drops: [{ id, has: [...], o: [...] }]`. When an earlier answer includes one of `has`, the listed options (which must exist in the question's `o` or its `adds`) are removed. At least 5 options must remain even if every drop applies. Good uses: a budget of `$0` drops paid-vendor or hardware-heavy options; a market that is an African country drops US-only payment or compliance options; an `Evenings only` or `Weekends only` hours answer drops options that need a large team; `Just me` in `y.team` drops options that need a staffed operation.

A drop keyed to `y.market` applies only when EVERY market the user picked is in its `has` list (people can pick up to three markets). Only drop options that truly do not apply in those markets; do not guess.

## `depth` on district questions
Add `depth: 'standard'` or `depth: 'deep'` in the `Q(...)` extra argument to hide a question at lighter depths. Questions without `depth` are core and must stay as they are. A question may only depend on (use `when`, `adds` or `drops` keyed to) a question of the SAME or a SHALLOWER depth. Never put `when` on an existing core question.

## District questions can now react to corner answers
A district question may use `when`, `adds` or `drops` whose `id` is a corner question id such as `g.b3.c` (it only fires if the user picked that corner and chose that option, which is what we want). Use `adds` with several entries to cover several corners, each adding options that fit that corner. A question can have only one `when`.

## Required counts for an extended region (the validator enforces these)
- 7 questions in EVERY corner (`a` to `d` core, `e`, `f`, `g` new).
- At least 5 new district questions with `depth: 'standard'` and 5 with `depth: 'deep'`; aim for about 7 of each, spread across people, shape, system, growth and edge (at least one in each district). All 10 to 18 options, specific, mutually distinct, ending in `?`.
- At least 8 district questions (new or existing) that react to corner answers. For existing questions, add `adds` or `drops` entries keyed to corner question ids; do not alter their existing options.
- At least 3 district questions that use `drops`.
- Every district `when`/`adds`/`drops` `has` option must exist verbatim on the trigger question.
- New question ids must be unique across ALL files in `src/content` (grep before using one).

## A NEW region (a file that does not exist yet)
Follow the structure below, but use the 7-tuple corner form for all 12 corners from the start, and meet all the counts above. Export `export default [theRegion];`. Use the exact `id`, `p` (id prefix), `name` and file name given in your assignment.

# Content brief: writing a region (domain) for the MindMap

The product is a "map" questionnaire. A person picks a region (domain), then a corner (sub-area), and the questions that follow narrow in on a specific product shape. The person does NOT have a problem in mind; the questions only gather information about what they are drawn to, who they could serve, how it would work and what features it would have. NEVER ask about pain points or "what problem do you solve". Questions describe the product space, not a problem to be confessed.

## Files and helpers
Write `src/content/<file>.ts`. Import helpers from `./lib` (`domain`, `B`, `Q`). Read `src/content/lib.ts` first. Default-export an ARRAY of domains: `export default [games, devtools];`.

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

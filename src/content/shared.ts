import { Q, Question } from './lib';

/* Part 1: you (shared road) */
export const you: Question[] = [
  Q('y.skill', 'skill', 'What is your strongest skill?', `Frontend development|Backend development|Mobile development|Data and AI|UI and UX design|Writing and teaching|Video and editing|Sales and outreach|Community building|Project management|Finance and operations|Game design|Hardware and electronics|Research and analysis`, 2),
  Q('y.stack', 'stack', 'Which tools do you build fastest in?', `Flutter|React or Next.js|Vue or Nuxt|Node.js|Python|Laravel or PHP|Django|Go|Rust|Supabase or Firebase|WordPress|No-code tools|Swift or Kotlin|Unity or Godot|React Native|Ruby on Rails`, 3),
  Q('y.exp', 'experience', 'How much have you shipped before?', `Nothing yet|A tutorial project|A portfolio project|One small live product|Several small live products|A product with paying users|A product with 1,000+ users|A product with 100,000+ users|A client project|A team product at a company`),
  Q('y.hours', 'hours', 'How many hours a week can you give this?', `Under 5|5 to 10|10 to 20|20 to 30|30 to 40|40 to 60|60 or more|Weekends only|Evenings only|Irregular bursts`),
  Q('y.budget', 'budget', 'What can you spend to start?', `$0|Under $100|$100 to $500|$500 to $2k|$2k to $10k|$10k to $50k|$50k or more|Company-funded|Grant-funded|Funded by revenue only`),
  Q('y.team', 'team', 'Who builds with you?', `Just me|With a designer|With a co-founder|A small team|Freelancers|My company's team|Community contributors|AI tools|An agency|Family or friends`, 2),
  Q('y.style', 'style', 'How do you like to work?', `Ship fast and fix later|Plan carefully first|Build in public|Build in private until ready|Talk to users daily|Heads down for weeks|In short sprints|Alongside a community|With a strict weekly rhythm|By following curiosity`, 2),
  Q('y.ambition', 'ambition', 'How big do you want this to get?', `Weekend project|Portfolio piece|Indie income|Side business|Lifestyle business|Venture-scale startup|Open-source project|Audience builder|Productized service|Acquisition target`),
  Q('y.customer', 'customer', 'Who do you prefer to sell to, or serve?', `Everyday consumers|Students|Parents|Small business owners|Freelancers|Large companies|Schools|Churches and community groups|Developers|Creators|Government bodies|Nonprofits|Professionals like lawyers or doctors`, 3),
  Q('y.time', 'time', 'How long until a first version?', `A weekend|1 week|2 weeks|1 month|2 months|3 months|6 months|1 year|No fixed date|Whenever it feels ready`),
  Q('y.risk', 'risk', 'How much risk are you comfortable with?', `None, it must work out|Low, small bets only|Moderate, one bet at a time|High, I can lose the time|High, I can lose the money|I treat it as an experiment|I will quit my job for the right one|I will not quit anything|I can pause it any time`),
  Q('y.assets', 'assets', 'What do you already own that helps?', `An audience|A newsletter list|A community|Company customers|A teaching platform|A professional network|A local reputation|Savings or runway|A domain or brand|Reusable code|Usable data|Nothing yet`, 3),
  Q('y.market', 'market', 'Where are you based or able to sell?', `Nigeria|Uganda|Kenya|Ghana|South Africa|Rest of Africa|USA|UK or Europe|India|Southeast Asia|Latin America|Middle East|Global|Diaspora communities`, 3),
  Q('y.lang', 'language', 'Which languages can you build and support in?', `English|French|Pidgin|Yoruba|Igbo|Hausa|Swahili|Luganda|Arabic|Portuguese|Spanish|Hindi|Mandarin|Several at once`, 3),
  Q('y.pull', 'motivation', 'What keeps you building when it gets hard?', `Seeing people use it|Money|Learning|Proving I can|Building a legacy|Freedom|Helping my community|Beating a rival|Making something beautiful|Solving a puzzle|Recognition|Having a team`, 2),
];

/* Part 2: regions */
export const allDomains = [
  'Games', 'Developer tools', 'Education and learning', 'Money and fintech', 'Health and wellness', 'Team productivity',
  'Creator economy and media', 'Commerce and retail', 'Home, family and community', 'Physical world',
  'Legal, compliance and government', 'Travel, events and local life',
  'AI and automation', 'Agriculture and food', 'Jobs, careers and work', 'Real estate and property',
  'Transport and logistics', 'Social and community apps',
];

export const regionQs: Question[] = [
  { ...Q('r.regions', 'regions', 'Which regions do you want to explore?', allDomains.join('|'), 2), noOther: true,
    note: 'Pick one, or two to combine them. Each region opens its own set of corners and questions.' },
  Q('r.pull', 'pull', 'What pulls you toward it?', `Something that frustrated me|A problem I saw someone else have|A hobby I love|Curiosity about a technology|A market trend|A gap in my local market|A skill I want to use|Requests from my audience|Industry knowledge|A job I once did|A tool I wish existed|A product I'd remix`, 2),
];

/* Part 3: crossover (only when two regions are picked) */
export const cross: Question[] = [
  { ...Q('x.fit', 'crossover', 'How do {A} and {B} fit together?', `{B} is the subject and {A} is how people experience it|{A} is the subject and {B} is how people experience it|{B} is the reward for engaging with {A}|{A} is the reward for engaging with {B}|{B} supplies the audience and {A} supplies the product|{A} supplies the audience and {B} supplies the product|{B} pays for the {A} side|{A} pays for the {B} side|{B} is a tool the {A} product runs on|Users start in {A} and move into {B}|Users start in {B} and move into {A}|They are two modes of one product`), x: true },
  { ...Q('x.first', 'crossfirst', 'Which side do you build first?', `The {A} side first|The {B} side first|Both at once|A thin {A} layer over an existing {B} product|A thin {B} layer over an existing {A} product|A free {A} hook that leads to {B}|A free {B} hook that leads to {A}|A single feature from {A} inside {B}|A single feature from {B} inside {A}|A manual version of both first|Whichever my first users ask for|I am not sure yet`), x: true },
  { ...Q('x.shared', 'crossshared', 'What do the two sides share?', `One account|One feed|One wallet or points balance|One group or community|One calendar|One content library|One set of analytics|One admin dashboard|One notification stream|Nothing, they are separate apps`, 3), x: true },
];

/* Part 4: reality check (shared) */
export const close: Question[] = [
  Q('c.evidence', 'evidence', 'How strong is the evidence for your belief?', `A hunch|A gut feeling from experience|One conversation|Five conversations|10 or more interviews|A survey with responses|A landing page with signups|A prototype people used|Pre-orders or deposits|Paying customers|Public data or research|A competitor already proving it`),
  Q('c.commit', 'commit', 'Would you still build this if it earned nothing for a year?', `Definitely yes|Probably yes|Only with a deadline|Only with a salary|Only with a co-founder|Only if users ask for it|Only as a learning project|Not really|I would pause after 3 months|I would pivot after 3 months`),
  Q('c.test', 'test', 'What will you do first to test it?', `Talk to 10 people|Put up a landing page and waitlist|Pre-sell it|Build a clickable prototype|Post in a community|Run a survey|Run a manual version by hand|Study competitors closely|Run a small ad test|Build in public|Pilot with one group|Ship the smallest version`, 2),
  Q('c.planb', 'plan_b', 'If growth has not started in 3 months, what is plan B?', `Narrow to a smaller group|Add a manual concierge service|Pay for the first users|Partner with an existing community|Change the audience|Change the core action|Add a single-player feature|Switch to businesses as customers|Switch platform|Make it free|Pause and talk to users|Shut it down`),
  Q('c.success', 'success', 'How will you know it is working?', `Signups|Daily active users|Paying customers|Monthly revenue|Retention|Time saved by users|Shares and referrals|Completion rate|Reviews and stories|GitHub stars or forks|Class or group adoption|People return after a week`, 2),
];

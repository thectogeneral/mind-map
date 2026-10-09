/* Content helpers for the MindMap. Every closed question needs 10+ options (checked by `npm run validate`). */
export type Cond = { id: string; has: string[] };
export interface Question {
  id: string;
  k: string;
  t: string;
  o: string[];
  max: number;
  noOther?: boolean;
  note?: string;
  /** Show this question only when an earlier answer included one of these options. */
  when?: Cond;
  /** Extra options appended when an earlier answer included one of these options. */
  adds?: (Cond & { o: string[] })[];
  /** Crossover question: {A} and {B} are replaced by the two region names. */
  x?: boolean;
}
export interface District { id: string; title: string; blurb: string; qs: Question[] }
export interface Domain {
  id: string;
  name: string;
  p: string;
  people: string;
  blurb: string;
  fork: Question;
  branches: Record<string, Question[]>;
  districts: District[];
}
export type Extra = Partial<Pick<Question, 'when' | 'adds' | 'note' | 'noOther'>>;

export const O = (s: string): string[] => s.split('|').map((x) => x.trim()).filter(Boolean);
export const Q = (id: string, k: string, t: string, o: string, max = 1, extra: Extra = {}): Question => ({ id, k, t, o: O(o), max, ...extra });

/** A corner (sub-area) holds four questions, each narrowing the idea further.
 *  a: what the user does, b: what brings them back, c: features (pick many), d: what makes it specific. */
type Tup = [string, string, Extra?];
export function B(prefix: string, i: number, name: string, a: Tup, b: Tup, c: Tup, d: Tup): [string, Question[]] {
  return [name, [
    Q(`${prefix}.b${i}.a`, 'corner_a', a[0], a[1], 2, a[2]),
    Q(`${prefix}.b${i}.b`, 'corner_b', b[0], b[1], 3, b[2]),
    Q(`${prefix}.b${i}.c`, 'features', c[0], c[1], 6, c[2]),
    Q(`${prefix}.b${i}.d`, 'angle', d[0], d[1], 2, d[2]),
  ]];
}

interface DomainInput {
  id: string; p: string; name: string; people: string; blurb: string; forkText: string;
  branches: [string, Question[]][];
  peopleQs: Question[]; shapeQs: Question[]; systemQs: Question[]; growthQs: Question[]; edgeQs: Question[];
}
export function domain(o: DomainInput): Domain {
  const branches: Record<string, Question[]> = {};
  o.branches.forEach((b) => { branches[b[0]] = b[1]; });
  const fork = Q(`${o.p}.sub`, 'subarea', o.forkText, o.branches.map((b) => b[0]).join('|'), 2);
  return {
    id: o.id, name: o.name, p: o.p, people: o.people, blurb: o.blurb, fork, branches,
    districts: [
      { id: 'people', title: o.people, blurb: 'Who it is for and when they reach for it.', qs: o.peopleQs },
      { id: 'shape', title: 'Shape', blurb: 'What it is and where it runs.', qs: o.shapeQs },
      { id: 'system', title: 'Features and systems', blurb: 'The parts that sit behind the screens.', qs: o.systemQs },
      { id: 'growth', title: 'Growth and money', blurb: 'How it earns and how people find it.', qs: o.growthQs },
      { id: 'edge', title: 'Edge and risk', blurb: 'What you believe and what could stop you.', qs: o.edgeQs },
    ],
  };
}

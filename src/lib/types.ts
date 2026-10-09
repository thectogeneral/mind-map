export interface Idea {
  id: string;
  title: string;
  region: string;       // "Games" or "Games + Education and learning"
  corner: string;       // corner name(s)
  audience: string;
  moment: string;
  platform: string;
  action: string;
  retention: string;
  features: string[];
  angle: string;
  loop: string;
  refill: string;
  money: string;
  alone: string;
  breaks_instinct?: boolean;
}
export interface Score { id: string; c: number[]; total: number; generic: boolean; note: string }
export interface Detail { id: string; watch: string[]; look_for: string[]; friction: string; ask: string; fails: string; change: string; test: string }
export interface Result {
  mode: 'rules' | 'ai';
  profile: string;
  constraints: string[];
  ideas: Idea[];
  scores: Score[];
  details: Detail[];
  capped: boolean;
  at: number;
}
export const CRITERIA = ['Fits your constraints', 'Audience is reachable', 'Useful alone', 'Growth loop', 'Refills itself', 'Evidence', 'Robust to your risk', 'Differs from prior art'] as const;
const PROPER = /^(Android|iOS|WhatsApp|Telegram|Discord|Steam|Slack|Chrome|Windows|Mac|Flutter|SMS|USSD|API|PWA)/;
export const platformText = (p: string) => (PROPER.test(p) ? p : lc(p));
export const article = (w: string) => (/^(a|e|i|o|u|iOS|SMS|SDK|API|hour|honest)/i.test(w) && !/^(u[^aeiou]|uni|use|usb)/i.test(w) ? 'an' : 'a');
export const sentence = (i: Idea) =>
  `For ${i.audience}${i.moment ? ' (' + i.moment.toLowerCase() + ')' : ''}, ${article(platformText(i.platform))} ${platformText(i.platform)} that lets them ${lc(i.action)}. Useful alone through ${lc(i.alone)}, growing through ${lc(i.loop)}, refilled by ${lc(i.refill)}.`;
export const lc = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
export const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
export function ranked(r: Result) {
  return r.ideas
    .map((idea) => ({ idea, score: r.scores.find((s) => s.id === idea.id)! }))
    .filter((x) => x.score)
    .sort((a, b) => (b.score.total - (b.score.generic ? 3 : 0)) - (a.score.total - (a.score.generic ? 3 : 0)));
}

import type { Domain } from './lib';
import gd from './games-devtools';
import em from './education-money';
import ht from './health-team';
import cc from './creator-commerce';
import hp from './home-physical';
import lt from './legal-travel';
import { allDomains } from './shared';

const all: Domain[] = [...gd, ...em, ...ht, ...cc, ...hp, ...lt];
/** Domains in the order of the region question's options. */
export const domains: Domain[] = allDomains.map((n) => {
  const d = all.find((x) => x.name === n);
  if (!d) throw new Error('No content for region: ' + n);
  return d;
});
export * from './shared';

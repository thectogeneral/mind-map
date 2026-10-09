export default function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="3" fill="hsl(158 55% 18%)" />
      <rect x="3" y="3" width="34" height="34" rx="2" fill="none" stroke="hsl(42 50% 97%)" strokeOpacity="0.18" />
      <path d="M9 29 H18 V19 H27 V11" fill="none" stroke="hsl(42 50% 97%)" strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx="9" cy="29" r="3" fill="hsl(42 50% 97%)" />
      <circle cx="27" cy="11" r="3.4" fill="hsl(28 92% 54%)" />
      <circle cx="18" cy="19" r="2" fill="hsl(28 92% 54%)" />
    </svg>
  );
}

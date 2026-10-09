import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg width="180" height="180" viewBox="0 0 40 40">
        <rect width="40" height="40" fill="#154735" />
        <path d="M9 29 H18 V19 H27 V11" fill="none" stroke="#fbf9f4" strokeWidth="2.6" strokeLinejoin="round" />
        <circle cx="9" cy="29" r="3" fill="#fbf9f4" />
        <circle cx="27" cy="11" r="3.4" fill="#f6831e" />
        <circle cx="18" cy="19" r="2" fill="#f6831e" />
      </svg>
    ),
    size,
  );
}

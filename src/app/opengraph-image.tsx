import { ImageResponse } from 'next/og';

export const alt = 'MindMap: find a product idea from what you are drawn to';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, background: '#154735', color: '#fbf9f4' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <svg width="120" height="120" viewBox="0 0 40 40">
            <rect width="40" height="40" rx="4" fill="#fbf9f4" fillOpacity="0.08" />
            <path d="M9 29 H18 V19 H27 V11" fill="none" stroke="#fbf9f4" strokeWidth="2.6" strokeLinejoin="round" />
            <circle cx="9" cy="29" r="3" fill="#fbf9f4" />
            <circle cx="27" cy="11" r="3.4" fill="#f6831e" />
            <circle cx="18" cy="19" r="2" fill="#f6831e" />
          </svg>
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 700 }}>
            Mind<span style={{ color: '#f6831e' }}>Map</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', fontSize: 68, fontWeight: 700, lineHeight: 1.1 }}>Start from what you are drawn to. Leave with a product idea.</div>
          <div style={{ display: 'flex', fontSize: 32, opacity: 0.75 }}>Answer a map of questions, get ideas, a test plan, and a build prompt.</div>
        </div>
      </div>
    ),
    size,
  );
}

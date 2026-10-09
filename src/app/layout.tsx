import type { Metadata, Viewport } from 'next';
import './globals.css';

const DESCRIPTION = 'Start from what you are drawn to, not a problem. MindMap turns your answers into product ideas, a test plan for each, and a ready-to-use build prompt.';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'MindMap: find a product idea worth building', template: '%s | MindMap' },
  description: DESCRIPTION,
  applicationName: 'MindMap',
  openGraph: { type: 'website', siteName: 'MindMap', title: 'MindMap: find a product idea worth building', description: DESCRIPTION },
  twitter: { card: 'summary_large_image', title: 'MindMap: find a product idea worth building', description: DESCRIPTION },
};
export const viewport: Viewport = { themeColor: '#F8F6F0', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,700;0,9..144,900;1,9..144,300;1,9..144,400;1,9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

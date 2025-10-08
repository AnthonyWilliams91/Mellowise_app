import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mellowise - AI-Powered LSAT Prep',
  description: 'Join the waitlist for Mellowise, the AI-powered LSAT prep platform that adapts to you.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-black">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/hack-font@3/build/web/hack.css" />
      </head>
      <body className="font-['Hack',monospace] bg-black">{children}</body>
    </html>
  );
}

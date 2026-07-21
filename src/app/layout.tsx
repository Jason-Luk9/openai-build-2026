import type { Metadata } from 'next';
import { IBM_Plex_Mono, Newsreader, Public_Sans } from 'next/font/google';
import './globals.css';

const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
});

const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  weight: ['400', '500', '600'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sprout — Singapore market-entry playbook',
  description:
    'A source-backed Singapore market-entry playbook for ASEAN founders.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${newsreader.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

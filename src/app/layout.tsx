import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CVEEEZ - Your Career Partner',
  description: 'Professional CV writing and career development services.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The lang attribute will be dynamically set by the LanguageProvider
    <html suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&family=Lato:wght@400;700&family=Poppins:wght@600;800&display=swap" rel="stylesheet" />
      </head>
      <body>
          {children}
      </body>
    </html>
  );
}

import './globals.css';
import { Bebas_Neue, Space_Mono } from 'next/font/google';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bebas',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata = {
  title: 'Bug Auction Arena | Live Coding Platform',
  description: 'A futuristic live auction and coding contest platform for hackers and developers.',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${spaceMono.variable}`}>
      <body suppressHydrationWarning>
        <div id="background-animation"></div>
        {children}
      </body>
    </html>
  );
}

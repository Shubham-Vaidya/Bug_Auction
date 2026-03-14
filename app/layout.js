import './globals.css';
import { Bebas_Neue } from 'next/font/google';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bebas',
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
    <html lang="en" className={bebasNeue.variable}>
      <body suppressHydrationWarning>
        <div id="background-animation"></div>
        {children}
      </body>
    </html>
  );
}

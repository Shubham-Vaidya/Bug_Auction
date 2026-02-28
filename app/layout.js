import './globals.css';

export const metadata = {
  title: 'Bug Auction Arena | Live Coding Platform',
  description: 'A futuristic live auction and coding contest platform for hackers and developers.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600;700&family=Orbitron:wght@400;500;700;900&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <div id="background-animation"></div>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'DashNews — Breaking News & Stories',
  description: 'The latest breaking news, stories and updates from around the world.',
  metadataBase: new URL('https://dashnews.top'),
  openGraph: {
    title: 'DashNews — Breaking News & Stories',
    description: 'The latest breaking news, stories and updates from around the world.',
    url: 'https://dashnews.top',
    siteName: 'DashNews',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DashNews — Breaking News & Stories',
    description: 'The latest breaking news, stories and updates from around the world.',
  },
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5412699736062085"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <nav>
          <a className="nav-logo" href="/">⚡ DashNews</a>
          <div className="nav-links">
            <a href="/">Home</a>
            <a href="/#posts-section">Articles</a>
          </div>
        </nav>
        {children}
        <footer>
          <p>⚡ <a href="/">DashNews</a> — All stories are real and for entertainment only.</p>
        </footer>
      </body>
    </html>
  )
}

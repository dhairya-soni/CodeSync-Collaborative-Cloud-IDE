import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CodeSync — Collaborative Cloud IDE',
  description: 'Real-time collaborative code editor with multi-language execution, AI assistance, and instant sharing. Code together, build faster.',
  keywords: ['collaborative IDE', 'online code editor', 'real-time coding', 'cloud IDE', 'pair programming'],
  authors: [{ name: 'Dhairya Soni' }],
  openGraph: {
    title: 'CodeSync — Collaborative Cloud IDE',
    description: 'Real-time collaborative code editor with multi-language execution. Code together, build faster.',
    type: 'website',
    siteName: 'CodeSync',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeSync — Collaborative Cloud IDE',
    description: 'Real-time collaborative code editor. Code together, build faster.',
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%233b82f6'/><text x='50' y='72' font-size='64' font-family='monospace' font-weight='bold' fill='white' text-anchor='middle'>{'}'}</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#161b22',
              border: '1px solid #30363d',
              color: '#e6edf3',
            },
          }}
        />
      </body>
    </html>
  );
}

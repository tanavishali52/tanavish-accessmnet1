import type { Metadata } from 'next';
import './globals.css';
import StoreProvider from '@/providers/StoreProvider';

export const metadata: Metadata = {
  title: 'NexusAI — AI Model Marketplace · Discover, Compare & Deploy',
  description: 'The AI model hub trusted by 50,000+ developers. Discover, compare, and deploy 220+ AI models from 28+ leading labs.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}

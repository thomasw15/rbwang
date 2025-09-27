import type { Metadata } from 'next';
import './globals.css';
import 'katex/dist/katex.min.css';
import { Header } from '../components/Header';

export const metadata: Metadata = {
  title: 'Rongbiao (Thomas) Wang',
  description: 'Personal research index',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-white text-black">
        <div className="min-h-screen">
          <Header />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}



import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Memo App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen flex justify-center">
        {children}
      </body>
    </html>
  );
}

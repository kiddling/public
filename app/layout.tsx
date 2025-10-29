import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Student Gallery',
  description: 'Showcase of student work with filtering, lightbox, and before/after comparisons',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

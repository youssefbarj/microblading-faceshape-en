import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Morphological Analysis - Mini Game",
  description: "Drag and drop the eyebrow shapes onto the matching face types",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

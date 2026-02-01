import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caveman Poetry",
  description: "A real-time multiplayer party game. Describe words like a caveman!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="cave-texture min-h-screen">
        {children}
      </body>
    </html>
  );
}

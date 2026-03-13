import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArvyaX Journal",
  description: "Immersive nature session journaling",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const notoSerif = Noto_Serif_JP({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kaimyo.vercel.app"),
  title: "戒名メーカー",
  description: "あなたの戒名、授けます。",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "戒名メーカー",
    description: "あなたの戒名、授けます。",
    images: [
      {
        url: "https://og-api-self.vercel.app/api/og?title=KAIMYO&category=AI%20Tools",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSerif.variable} antialiased`}>{children}</body>
    </html>
  );
}

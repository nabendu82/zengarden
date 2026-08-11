import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Nav } from "@/components/layout/Nav";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Model Zen Garden",
  description:
    "Side-by-side LLM garden arena, benchmark charts, and immersive sandbox comparisons.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${display.variable} ${body.variable} min-h-screen antialiased`}
      >
        <ThemeProvider>
          <Nav />
          <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}

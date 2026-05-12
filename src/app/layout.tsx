import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "CollaboLab — Find Your People. Build Together.",
    template: "CollaboLab — Find Your People. Build Together.",
  },
  description:
    "Platform kolaborasi real-time untuk Gen-Z. Temukan tim, bangun project, dan kembangkan skill bersama. Sistem reputasi Trust Score menjaga ekosistem tetap sehat.",
  keywords: ["kolaborasi", "mahasiswa", "project", "lomba", "hackathon", "Gen-Z", "startup", "trust score"],
  authors: [{ name: "CollaboLab Team" }],
  openGraph: {
    title: "CollaboLab — Find Your People. Build Together.",
    description: "Platform kolaborasi real-time untuk Gen-Z dengan sistem reputasi Trust Score.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-white antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

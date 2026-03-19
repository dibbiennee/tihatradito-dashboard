import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Scopri la Verità — Metodo Riservato",
  description:
    "Rispondi a 3 domande. Scopri se stai facendo la cosa giusta — e come ottenere la verità in meno di 10 minuti.",
  openGraph: {
    title: "Scopri la Verità — Metodo Riservato",
    description:
      "Rispondi a 3 domande e scopri la verità in meno di 10 minuti.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`h-full antialiased ${bebasNeue.variable} ${dmSans.variable}`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

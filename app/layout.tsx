import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BudgetProvider } from "@/context/BudgetContext";

export const metadata: Metadata = {
  title: "Budget+ | Construisez votre budget en 5 minutes",
  description:
    "Application suisse de gestion de budget mensuel, pour particuliers et professionnels de l'accompagnement budgétaire.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f6e56",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen font-sans antialiased">
        <BudgetProvider>{children}</BudgetProvider>
      </body>
    </html>
  );
}

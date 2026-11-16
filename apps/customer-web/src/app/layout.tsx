import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: "RasoiIQ — India-First AI Meal Planning & Multi-Grocer Marketplace",
  description: "Plan your week's meals in minutes, discover authentic Indian recipes, auto-generate scaled grocery lists, and compare prices across Blinkit, Zepto, DMart Ready and BigBasket.",
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col justify-between selection:bg-forest-100 selection:text-forest-900">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

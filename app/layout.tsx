import type { Metadata } from "next";
import { Titillium_Web } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { TooltipProvider } from "@/components/ui/tooltip";

const titillium = Titillium_Web({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-titillium",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fabricación | Formatto",
  description: "Sistema de gestión de órdenes de fabricación de muebles",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={titillium.variable}>
      <body className="min-h-screen bg-background antialiased">
        <TooltipProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
        </TooltipProvider>
      </body>
    </html>
  );
}

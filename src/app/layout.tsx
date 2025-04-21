import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavbarClient from "@/components/navbarClient";
import ApolloWrapper from "@/components/ApolloWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bodega EKL",
  description: "Sistema de gestión de bodega",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ApolloWrapper>
          <NavbarClient />
          {children}
        </ApolloWrapper>
      </body>
    </html>
  );
}

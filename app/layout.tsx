import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/**
 * Font configuration using Inter - a clean, professional typeface
 * commonly used in enterprise applications for its excellent readability.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Metadata for SEO and browser display.
 */
export const metadata: Metadata = {
  title: "Sensor Selection | Data Center Management",
  description:
    "Select and manage sensors across data center locations for monitoring and analysis.",
  keywords: ["sensors", "data center", "monitoring", "infrastructure"],
};

/**
 * Root Layout Component
 *
 * Provides the base HTML structure and global styling context for the application.
 * Uses Inter font for a clean, enterprise-appropriate aesthetic.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}

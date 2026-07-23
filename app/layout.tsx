import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import RegisterSW from "@/components/pwa/RegisterSW";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MyAccentTrainer — Speak English clearly, keep your voice",
    template: "%s · MyAccentTrainer",
  },
  description:
    "An AI communication coach that helps you speak English clearly and confidently — personalized to your language and goals, guided by Nina.",
  applicationName: "MyAccentTrainer",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "MyAccentTrainer" },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#20ad68",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}

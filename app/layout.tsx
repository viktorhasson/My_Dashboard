import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { MobileHeader, MobileBottomNav } from "@/components/mobile-nav";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Manager",
  description: "A personal project & task manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full">
        <Toaster>
          <Sidebar />
          <div className="flex min-h-full flex-1 flex-col">
            <MobileHeader />
            <main className="flex-1 overflow-x-hidden p-4 pb-24 md:p-6 md:pb-6">{children}</main>
          </div>
          <MobileBottomNav />
        </Toaster>
      </body>
    </html>
  );
}

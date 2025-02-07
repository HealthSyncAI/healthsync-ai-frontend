"use client"
// import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar"; // Import the Sidebar component
import { usePathname } from "next/navigation"; // Import usePathname
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname(); // Get the current route

  const isLandingPage = pathname === "/"; // Check if the current route is the landing page

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex">
          {/* Conditionally render the Sidebar */}
          {!isLandingPage && <Sidebar />}

          {/* Main Content */}
          <div className={`flex-1 ${isLandingPage ? "bg-white" : "bg-gray"}`}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
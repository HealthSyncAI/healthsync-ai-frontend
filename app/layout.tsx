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
  // Added check for login/register pages explicitly if they should not have sidebar
  const isAuthPage = pathname === "/" || pathname === "/register"; // Adjust if register path is different
  const doctorPage = pathname.includes("/doctor") || pathname.includes("/patient"); // Check if the current route is the doctor page

  // Determine if sidebar should be shown
  const showSidebar = !isAuthPage && !doctorPage;


  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Ensure the outer container is also flex if needed, but body usually suffices */}
        <div className="flex">
          {/* Conditionally render the Sidebar */}
          {showSidebar && <Sidebar />}

          {/* Main Content */}
          {/* --- Added h-screen overflow-y-auto --- */}
          <div className={`flex-1 ${showSidebar ? "bg-gray-50" : "bg-white"} h-screen overflow-y-auto`}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
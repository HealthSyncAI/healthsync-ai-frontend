"use client"
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Sidebar() {
  const pathname = usePathname(); // Get the current path

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Profile", path: "/profile" },
    { name: "Calendar", path: "/calendar" },
    { name: "Chatbot", path: "/help" },
  ];

  return (
    <div className="w-[239px] h-screen bg-white shadow-md flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-[30px] font-bold text-primary">HealthSync AI</h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-4 px-4 mt-12">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`flex items-center gap-6 px-4 py-2 rounded-md text-[16px] h-12 ${
              pathname === item.path ? "bg-primary text-white" : "text-[#7E7E7E]"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4">
        <button
          className="flex items-center gap-4 px-4 py-2 text-gray-600 hover:text-red-500"
          onClick={() => alert("Logging out...")}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
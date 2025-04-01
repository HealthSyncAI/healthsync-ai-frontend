"use client"
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Chatbot", path: "/chatbot" },
    // { name: "Doctor Notes", path: "/doctor-note" },
  ];

  const handleLogout = () => {
    alert("You are being logged out.");
    console.log("Clearing local storage...");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    console.log("Redirecting to /");
    router.push("/");
  };

  // const userRole = typeof window !== 'undefined' ? localStorage.getItem("userRole") : null;

  return (
    // --- Added sticky top-0 ---
    <div className="w-[239px] h-screen bg-white shadow-md flex flex-col justify-between sticky top-0">
      <div> {/* Top section */}
        <div className="p-6 flex items-center justify-center">
           <Link href="/dashboard" className="text-[30px] font-bold text-primary no-underline hover:opacity-90">
             HealthSync AI
           </Link>
        </div>
        <nav className="flex flex-col gap-4 px-4 mt-12">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-6 px-4 py-2 rounded-md text-[16px] h-12 transition-colors duration-150 ${
                pathname === item.path
                  ? "bg-primary text-white font-medium"
                  : "text-[#7E7E7E] hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-200">
        <button
          className="flex w-full items-center gap-4 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150"
          onClick={handleLogout}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}
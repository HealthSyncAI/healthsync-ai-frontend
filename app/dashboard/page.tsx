// app/dashboard/page.tsx
import Image from "next/image";
import DashboardSearchbar from "@/components/Dashboard-searchbar";

export default function Dashboard() {
  const first_name = "John"; // Replace with dynamic data
  const last_name = "Doe";   // Replace with dynamic data

  return (
    <div className="flex flex-col justify-start min-h-screen font-[family-name:var(--font-geist-sans)] p-6 gap-4">
      {/* Top Section */}
      <div className="flex flex-row items-center justify-between h-[78px] w-full">
        <div className="flex flex-col">
          <p className="text-[20px] text-[#747474]">
            Hi, {first_name} {last_name}!
          </p>
          <p className="text-[32px] font-bold text-[#232323]">
            Hi, {first_name} {last_name}!
          </p>
        </div>
        <div>
          <DashboardSearchbar />
        </div>
      </div>

      {/* Main Section */}
      <div className="flex flex-row gap-4 w-full">
        <Image
          src="/images/dashboard-doctor.png"
          alt="dashboard-graph"
          width={1200}
          height={600}
          className="object-cover"
        />
      </div>
    </div>
  );
}
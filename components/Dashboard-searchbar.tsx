export default function DashboardSearchbar() {
  return (
    <div className="flex items-center gap-4 bg-[#EEEEEE] rounded-[10px] w-[580px] h-[50px] p-2 justify-between">
      <input
        type="text"
        placeholder="Search for patients, appointments, etc."
        className="text-[#7A7D84] bg-[#EEEEEE] text-lg rounded-md"
      />
      <button className="bg-primary w-[82px] h-full text-white rounded-md">
        Search
      </button>
    </div>
  );
}

// BookingBox Component
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  specialization: string | null;
  qualifications: string | null;
  email: string;
  is_available: boolean;
  years_experience: number;
  bio: string;
  rating: number;
}

interface BookingBoxProps {
  onClose: () => void;
  onBack: () => void;
  onDoctorSelected: (doctor: Doctor) => void;
  onDateSelected: (date: string) => void;
  onTimeSelected: (time: string) => void;
}

export default function BookingBox({
  onBack,
  onDoctorSelected,onDateSelected,
  onTimeSelected,
}: BookingBoxProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateInternal, setSelectedDateInternal] = useState<string | null>(null);
  const [selectedTimeInternal, setSelectedTimeInternal] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorInternal, setSelectedDoctorInternal] = useState<Doctor | null>(null);

  const token = localStorage.getItem("auth_token") || "";
  const router = useRouter();

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctorInternal) {
      onDoctorSelected(selectedDoctorInternal);
    }
  }, [selectedDoctorInternal, onDoctorSelected]);

  useEffect(() => {
    if (selectedDateInternal) {
      onDateSelected(selectedDateInternal);
    }
  }, [selectedDateInternal, onDateSelected]);

  useEffect(() => {
    if (selectedTimeInternal) {
      onTimeSelected(selectedTimeInternal);
    }
  }, [selectedTimeInternal, onTimeSelected]);

  const fetchDoctors = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/appointment/doctors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("Your session has expired. Please log in again.");
          router.push("/"); // Navigate to the login page
          return;
        }
        throw new Error("Failed to fetch doctors");
      }

      const data: Doctor[] = await response.json();
      setDoctors(data);
      // Set the first doctor as the default selected doctor
      if (data.length > 0) {
        setSelectedDoctorInternal(data[0]);
        onDoctorSelected(data[0]);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  // Helper function to get the days in the current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate(); // Last day of the month
    return Array.from({ length: days }, (_, i) => i + 1);
  };

  // Helper function to get the first day of the month
  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay(); // Day of the week (0 = Sunday, 1 = Monday, etc.)
  };

  // Navigate to the previous month
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  // Navigate to the next month
  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);

  const handleDoctorSelection = (doctor: Doctor) => {
    setSelectedDoctorInternal(doctor);
  };

  const handleDateSelection = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const formattedDate = `${day}-${month}-${year}`;
    setSelectedDateInternal(formattedDate);
  };

  const handleTimeSelection = (time: string) => {
    setSelectedTimeInternal(time);
  };

  return (
    <>
      <div className="flex flex-row gap-6 p-6">
        {/* Left Section */}
        <div className="flex flex-col gap-4 w-1/2">
          <button
            className="w-[40px] h-[40px] flex items-center justify-center rounded-full bg-gray-200"
            onClick={onBack}
          >
            ←
          </button>
          {selectedDoctorInternal && (
            <div className="flex flex-col gap-2">
              <p className="text-[20px] font-bold text-[#333]">
                {selectedDoctorInternal.first_name} {selectedDoctorInternal.last_name}
              </p>
              {selectedDoctorInternal.bio && (
                <p className="text-[16px] text-[#747474]">
                  Specialization: {selectedDoctorInternal.bio}
                </p>
              )}
              {selectedDoctorInternal.years_experience && (
                <p className="text-[16px] text-[#747474]">
                  Years Experience: {selectedDoctorInternal.years_experience}
                </p>
              )}
              {selectedDoctorInternal.rating && (
                <p className="text-[16px] text-[#747474]">
                  rating: {selectedDoctorInternal.rating}
                </p>
              )}
            </div>
          )}
          {/* Doctor List */}
          <div className="mt-4">
            <p className="text-[18px] font-semibold text-[#333]">Other Doctors</p>
            <div className="flex flex-col gap-2 mt-2 max-h-[200px] overflow-y-auto">
              {doctors.map((doctor) => (
                <button
                  key={doctor.id}
                  className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 ${
                    selectedDoctorInternal?.id === doctor.id ? "bg-primary text-white" : ""
                  }`}
                  onClick={() => handleDoctorSelection(doctor)}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <p className={`text-sm ${selectedDoctorInternal?.id === doctor.id ? "text-white" : "text-black"}`}>
                      {doctor.first_name[0]}{doctor.last_name[0]}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${selectedDoctorInternal?.id === doctor.id ? "text-white" : "text-[#333]"}`}>
                      {doctor.first_name} {doctor.last_name}
                    </p>
                    {doctor.specialization && (
                      <p className={`text-xs ${selectedDoctorInternal?.id === doctor.id ? "text-white" : "text-[#747474]"}`}>
                        {doctor.specialization}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col gap-4 w-1/2">
          <p className="text-[20px] font-bold text-[#333]">
            Select Date and Time
          </p>
          <div className="flex flex-col gap-4">
            {/* Calendar */}
            <div className="flex items-center justify-between">
              <button
                onClick={goToPreviousMonth}
                className="text-[16px] text-primary font-bold"
              >
                ←
              </button>
              <p className="text-[16px] font-bold text-[#333]">
                {currentDate.toLocaleString("default", { month: "long" })}{" "}
                {currentDate.getFullYear()}
              </p>
              <button
                onClick={goToNextMonth}
                className="text-[16px] text-primary font-bold"
              >
                →
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
                <p key={day} className="text-[14px] text-[#747474]">
                  {day}
                </p>
              ))}
              {/* Empty spaces for days before the first day of the month */}
              {Array.from({
                length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1,
              }).map((_, i) => (
                <div key={i} className="w-[40px] h-[40px]"></div>
              ))}
              {/* Days of the month */}
              {daysInMonth.map((day) => (
                <button
                  key={day}
                  className={`w-[40px] h-[40px] flex items-center justify-center rounded-full ${
                    selectedDateInternal ===
                    `${day}-${
                      currentDate.getMonth() + 1
                    }-${currentDate.getFullYear()}`
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-[#333]"
                  }`}
                  onClick={() => handleDateSelection(day)}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Selected Date Display */}
            <div className="mt-4">
              <p className="text-[16px] text-[#333]">
                {selectedDateInternal
                  ? `Selected Date: ${new Date(
                      selectedDateInternal.split("-").reverse().join("-")
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}`
                  : "Please select a date"}
              </p>
            </div>

            {/* Time Slots */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                "10:30am",
                "11:30am",
                "02:30pm",
                "03:00pm",
                "03:30pm",
                "04:30pm",
                "05:00pm",
                "05:30pm",
              ].map((time) => (
                <button
                  key={time}
                  className={`px-4 py-2 rounded-lg border ${
                    time === selectedTimeInternal
                      ? "bg-primary text-white border-primary"
                      : "bg-gray-200 text-[#333] border-gray-300"
                  }`}
                  onClick={() => handleTimeSelection(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
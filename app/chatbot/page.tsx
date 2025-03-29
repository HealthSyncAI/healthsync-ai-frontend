"use client";
import Image from "next/image";
import Chat from "@/components/Chat-bot";
import BookingBox from "@/components/Booking-box"; // Import the Appointment component
import { useState, useEffect } from "react";
import Loading from "@/components/Loading";
import { useRouter } from "next/navigation"; // Import useRouter

interface Chat {
  id: number;
  input_text: string;
  model_response: string;
  triage_advice: string | null;
  created_at: string;
  room_number: number;
}

interface ChatHistory {
  room_number: number;
  chats: Chat[];
}

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

export default function Chatbot() {
  const initialMessage = {
    sender: "bot",
    message: "Hello, how can I help you?",
  };

  const [messages, setMessages] = useState<
    { sender: string; message: string }[]
  >([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false); // State for confirm button loading
  const [section, setSection] = useState("chatbot");
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentRoomNumber, setCurrentRoomNumber] = useState<number | null>(
    null
  );
  const [triageAdvice, setTriageAdvice] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [isScheduling, setIsScheduling] = useState(false); // State to toggle the Appointment component
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const router = useRouter();
  const token = localStorage.getItem("auth_token") || "";

  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    fetchChatHistory();
    const storedFirstName = localStorage.getItem("username") || "";
    setFirstName(storedFirstName);
  }, []);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/chatbot/chats", {
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
        throw new Error("Failed to fetch chat history");
      }

      const data: ChatHistory[] = await response.json();
      setChatHistory(data.reverse());

      if (data.length > 0) {
        const highestRoomNumber = Math.max(
          ...data.map((room) => room.room_number)
        );
        setCurrentRoomNumber(highestRoomNumber + 1);
        setSelectedRoom(1);
      } else {
        setCurrentRoomNumber(1);
        setSelectedRoom(null);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", message: input }]);
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/chatbot/symptom",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            symptom_text: input,
            room_number: currentRoomNumber,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          alert("Your session has expired. Please log in again.");
          router.push("/"); // Navigate to the login page
          return;
        }
        throw new Error("Failed to fetch response from the server");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          message: data.analysis || "No response from the bot.",
        },
      ]);
      setTriageAdvice(data.triage_advice || null);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", message: "Something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }

    setInput("");
  };

  const handleNewChat = () => {
    const newRoomNumber = (currentRoomNumber || 0) + 1;
    setCurrentRoomNumber(newRoomNumber);
    setMessages([initialMessage]);
    setInput("");
    setIsLoading(false);
    setTriageAdvice(null);

    if (section !== "chatbot") {
      setSection("chatbot");
    }
  };

  const handleConfirmAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      alert("Please select a doctor, date, and time for the appointment.");
      return;
    }

    const year = parseInt(selectedDate.split("-")[2]);
    const month = parseInt(selectedDate.split("-")[1]) - 1; // Month is 0-indexed
    const day = parseInt(selectedDate.split("-")[0]);
    const hour = parseInt(selectedTime.split(":")[0]);
    const minute = parseInt(selectedTime.split(":")[1].slice(0, 2));
    const ampm = selectedTime.slice(-2);
    const adjustedHour = ampm === "pm" && hour !== 12 ? hour + 12 : ampm === "am" && hour === 12 ? 0 : hour;

    const startTime = new Date(year, month, day, adjustedHour, minute);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Assuming 1 hour appointment

    const appointmentData = {
      doctor_id: selectedDoctor.id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      telemedicine_url: "https://example.com/meeting/abc", // Replace with actual URL logic
    };

    try {
      setIsConfirming(true);
      const response = await fetch("http://localhost:8000/api/appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("Your session has expired. Please log in again.");
          router.push("/"); // Navigate to the login page
          return;
        }
        const errorData = await response.json();
        console.error("Error creating appointment:", errorData);
        alert(`Failed to create appointment: ${errorData.message || "Unknown error"}`);
        return;
      }

      console.log("Appointment created successfully!");
      alert("Appointment created successfully!");
      setIsScheduling(false); // Hide the booking component after confirmation
      setSelectedDoctor(null); // Clear selected doctor
      setSelectedDate(null); // Clear selected date
      setSelectedTime(null); // Clear selected time
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Failed to create appointment. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDoctorSelected = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleDateSelected = (date: string) => {
    setSelectedDate(date);
  };

  const handleTimeSelected = (time: string) => {
    setSelectedTime(time);
  };

  const renderChatContent = () => {
    if (section === "history") {
      const selectedRoomChats = chatHistory.find(
        (room) => room.room_number === selectedRoom
      )?.chats;

      return (
        <div className="flex flex-col gap-4 w-full h-full overflow-y-auto">
          {chatHistory.length > 0 ? (
            selectedRoomChats && selectedRoomChats.length > 0 ? (
              selectedRoomChats
                .sort((a, b) => a.id - b.id)
                .map((chat) => (
                  <div key={chat.id} className="flex flex-col gap-2">
                    <div className="flex justify-end">
                      <Chat sender="user" message={chat.input_text} />
                    </div>
                    <div className="flex justify-start">
                      <Chat sender="bot" message={chat.model_response} />
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-500">No messages in this room.</p>
            )
          ) : (
            <p className="text-gray-500">No chat history available.</p>
          )}
        </div>
      );
    }

    return (
      <>
        <div className="flex flex-col gap-4 w-full h-full overflow-y-auto">
          {messages.map((msg, index) => (
            <Chat key={index} sender={msg.sender} message={msg.message} />
          ))}
          {isLoading && <Loading />}
        </div>
        {triageAdvice === "schedule_appointment" && (
          <div className="mt-4 p-4 bg-red-100 border border-red-500 text-red-700 rounded-md">
            We recommend you to see the doctor.{" "}
            <button
              className="text-blue-500 underline"
              onClick={() => setIsScheduling(true)} // Show the Appointment component
            >
              Schedule an appointment now!
            </button>
          </div>
        )}
        <div className="flex flex-row gap-4 w-full h-[48px] mt-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            placeholder="Type a message"
            className="w-full h-full border-[1px] text-black bg-gray border-[#ABAEC2] rounded-[8px] px-4"
            disabled={isLoading || isConfirming}
          />
          <button
            className="w-[48px] h-full bg-gray text-white rounded-[8px] p-2 border-[1px] border-[#ABAEC2]"
            onClick={handleSendMessage}
            disabled={isLoading || isConfirming}
          >
            <Image
              src="/images/Send.png"
              width={20}
              height={20}
              alt="send"
              className="w-full"
            />
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col justify-start min-h-screen font-[family-name:var(--font-geist-sans)] p-6 gap-4">
      <div className="flex flex-row items-center justify-between h-[78px] w-full">
        <div className="flex flex-col">
          <p className="text-[20px] text-[#747474]">Hi, {firstName}!</p>
          <p className="text-[32px] font-bold text-[#232323]">Online Consult</p>
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex flex-col gap-4 p-6 w-full min-h-[774px] bg-white rounded-[12px] border-[1px] border-black/10">
        {isScheduling ? (
          <BookingBox
            onClose={() => setIsScheduling(false)}
            onBack={() => setIsScheduling(false)}
            onDoctorSelected={handleDoctorSelected}
            onDateSelected={handleDateSelected}
            onTimeSelected={handleTimeSelected}
          /> // Render Appointment component
        ) : (
          <>
            {/* Header Section */}
            <div className="flex flex-col gap-2">
              <h1 className="text-[24px] font-bold text-[#333]">
                Consultation Info
              </h1>
                <p className="text-[16px] text-[#747474]">
                Chat with our AI-powered chatbot to get started or view your chat history. You can also schedule an appointment with a doctor. The chatbot is just for pre-scanning.
                For more accurate diagnosis, please consult a doctor in person.
                </p>
            </div>

            {/* Tabs and Select Room */}
            <div className="flex flex-row justify-start items-start gap-8">
              {/* Section Tabs */}
              <div className="flex flex-col">
                <div className="text-sm font-medium text-black mb-2">
                  Section
                </div>
                <div
                  className="border border-[#ABAEC2] rounded-[8px] p-1 w-[218px]"
                  role="tablist"
                >
                  <button
                    role="tab"
                    aria-selected={section === "chatbot"}
                    onClick={() => setSection("chatbot")}
                    className={`px-4 py-2 text-[#747474] rounded-[8px] cursor-pointer ${
                      section === "chatbot"
                        ? "bg-primary text-white"
                        : "bg-white text-[#747474]"
                    }`}
                  >
                    Chatbot
                  </button>
                  <button
                    role="tab"
                    aria-selected={section === "history"}
                    onClick={() => setSection("history")}
                    className={`px-4 py-2 text-[#747474] rounded-[8px] cursor-pointer ${
                      section === "history"
                        ? "bg-primary text-white"
                        : "bg-white text-[#747474]"
                    }`}
                  >
                    See history
                  </button>
                </div>
              </div>

              {/* Select Room Dropdown */}
              {section === "history" && chatHistory.length > 0 && (
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-black mb-2">
                    Chat room
                  </div>
                  <select
                    id="room-select"
                    value={selectedRoom || ""}
                    onChange={(e) => setSelectedRoom(Number(e.target.value))}
                    className="w-[250px] h-[50px] block p-2 border border-[#ABAEC2] text-[#747474] rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  >
                    {chatHistory.map((room) => (
                      <option key={room.room_number} value={room.room_number}>
                        Room {room.room_number}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Chat Content */}
            <div className="flex flex-col gap-4 p-4 w-full h-[524px] mt-4 bg-gray rounded-[12px] border-[1px] border-black/10">
              {renderChatContent()}
            </div>
          </>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex flex-row gap-6 w-[451px] h-[48px] ml-auto mt-6">
        {!isScheduling && (
          <button
            className="w-full h-full text-[#232323] border-[1px] border-[#ABAEC2] rounded-[8px]"
            onClick={handleNewChat}
          >
            New Chat
          </button>
        )}
        {isScheduling ? (
          <button
            className="w-[215px] h-full bg-primary text-white rounded-[8px] ml-auto"
            onClick={handleConfirmAppointment}
            disabled={isConfirming}
          >
            Confirm
          </button>
        ) : (
          <button
            className="w-full h-full bg-primary text-white rounded-[8px]"
            onClick={() => setIsScheduling(true)} // Toggle BookingBox
          >
            Schedule Appointment
          </button>
        )}
      </div>
    </div>
  );
}

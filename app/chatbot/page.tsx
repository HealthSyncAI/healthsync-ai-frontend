"use client";
import Image from "next/image";
import Chat from "@/components/Chat-bot";
import BookingBox from "@/components/Booking-box"; // Import the Appointment component
import { useState, useEffect } from "react";
import Loading from "@/components/Loading";
import { useRouter } from "next/navigation"; // Import useRouter

// --- Keep interface definitions ---
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
// --- End interfaces ---

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
  // --- State variables for token and firstName ---
  const [token, setToken] = useState<string | null>(null); // Initialize as null
  const [firstName, setFirstName] = useState("");
  // --- ---

  // Function to handle unauthorized access
  const handleUnauthorized = () => {
      alert("Your session has expired or is invalid. Please log in again.");
      // Only try to remove if localStorage exists (client-side)
      if (typeof window !== 'undefined') {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("username");
      }
      setToken(null);
      setFirstName("");
      router.push("/");
  };

  // Moved localStorage access here
  useEffect(() => {
    // This code now runs only on the client
    const storedToken = localStorage.getItem("auth_token");
    const storedFirstName = localStorage.getItem("username") || "";

    if (storedToken) {
        setToken(storedToken);
        setFirstName(storedFirstName);
        fetchChatHistory(storedToken); // Pass token directly
    } else {
        // Handle case where token is not found on initial load
        console.warn("No auth token found. Redirecting to login.");
        // Redirect if no token - prevents API calls without auth
        handleUnauthorized();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs once on mount


  // Modified fetchChatHistory to accept token
  const fetchChatHistory = async (authToken: string) => {
    // **Important:** Check if authToken is valid before fetching
    if (!authToken) {
        console.error("fetchChatHistory called without a token.");
        // Optionally redirect or show error
        // handleUnauthorized(); // Redirect if no token
        return;
    }
    // Consider adding a loading state for history fetch
    // setIsLoadingHistory(true);
    try {
      const response = await fetch("http://localhost:8000/api/chatbot/chats", {
        headers: {
          Authorization: `Bearer ${authToken}`, // Use the passed token
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized(); // Use centralized handler
          return; // Stop execution
        }
        throw new Error(`Failed to fetch chat history (${response.status})`);
      }

      const data: ChatHistory[] = await response.json();
      setChatHistory(data.reverse()); // Keep reverse as in original

      if (data.length > 0) {
        const highestRoomNumber = Math.max(
          ...data.map((room) => room.room_number)
        );
        setCurrentRoomNumber(highestRoomNumber + 1);
        // Set selectedRoom to the most recent room (first after reverse) if history exists
        setSelectedRoom(data[0]?.room_number ?? null);
      } else {
        setCurrentRoomNumber(1); // Start at 1 if no history
        setSelectedRoom(null);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      // Optionally set an error state to inform the user
    } finally {
       // setIsLoadingHistory(false);
    }
  };

  const handleSendMessage = async () => {
    // --- Check for token from state ---
    if (!token) {
        console.error("Cannot send message: No auth token available.");
        handleUnauthorized(); // Redirect if no token
        return;
    }
    // --- ---

    if (!input.trim()) return;

    const userMessage = { sender: "user", message: input }; // Define user message object
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input; // Capture input before clearing
    setInput(""); // Clear input immediately
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/chatbot/symptom",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Use token from state
          },
          body: JSON.stringify({
            symptom_text: currentInput, // Use captured input
            room_number: currentRoomNumber,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return; // Stop execution
        }
        throw new Error(`Failed to fetch response from the server (${response.status})`);
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

      // Refresh history if a message was potentially added to a new room
      // This logic might need refinement depending on exactly when you want history updated
      const roomExists = chatHistory.some(room => room.room_number === currentRoomNumber);
      if (!roomExists && token) {
          fetchChatHistory(token); // Refetch to include the new room
      }

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", message: `Something went wrong. ${error instanceof Error ? error.message : 'Please try again.'}` },
      ]);
    } finally {
      setIsLoading(false);
    }

    // Input is already cleared above
  };

  const handleNewChat = () => {
    // Determine the next room number based on existing history
    const newRoomNumber = chatHistory.length > 0
        ? Math.max(...chatHistory.map(room => room.room_number)) + 1
        : 1; // Start at 1 if no history exists

    setCurrentRoomNumber(newRoomNumber);
    setMessages([initialMessage]);
    setInput("");
    setIsLoading(false);
    setTriageAdvice(null);
    setIsScheduling(false); // Close booking if open
    setSection("chatbot"); // Switch to chatbot view
    setSelectedRoom(null); // Ensure no history room is selected
  };


  const handleConfirmAppointment = async () => {
    // --- Check for token from state ---
    if (!token) {
      console.error("Cannot confirm appointment: No auth token available.");
      handleUnauthorized(); // Redirect if no token
      return;
    }
    // --- ---

    if (!selectedDoctor || !selectedDate || !selectedTime) {
      alert("Please select a doctor, date, and time for the appointment.");
      return;
    }

    // --- Keep original date/time parsing logic ---
    const year = parseInt(selectedDate.split("-")[2]);
    const month = parseInt(selectedDate.split("-")[1]) - 1; // Month is 0-indexed
    const day = parseInt(selectedDate.split("-")[0]);
    let hour = parseInt(selectedTime.split(":")[0]);
    const minute = parseInt(selectedTime.split(":")[1].slice(0, 2));
    const ampm = selectedTime.slice(-2).toLowerCase(); // Ensure lowercase comparison

    if (ampm === "pm" && hour !== 12) {
      hour += 12;
    } else if (ampm === "am" && hour === 12) { // Handle midnight case (12:xx AM -> 00:xx)
        hour = 0;
    }

     // Basic validation for parsed components
     if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
         alert("Invalid date or time format selected. Please re-select.");
         return;
     }

    // Consider creating date in UTC to avoid timezone issues if backend expects UTC
    // const startTime = new Date(Date.UTC(year, month, day, hour, minute));
    // Or keep local time if backend handles it:
    const startTime = new Date(year, month, day, hour, minute);

    // Check if Date object is valid
    if (isNaN(startTime.getTime())) {
        alert("Could not create a valid appointment date/time. Please check your selection.");
        return;
    }

    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Assuming 1 hour appointment
    // --- End date/time logic ---

    const appointmentData = {
      doctor_id: selectedDoctor.id,
      start_time: startTime.toISOString(), // Send ISO string format
      end_time: endTime.toISOString(),     // Send ISO string format
      telemedicine_url: "https://example.com/meeting/abc", // Replace with actual URL logic
    };

    setIsConfirming(true);
    try {
      const response = await fetch("http://localhost:8000/api/appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Use token from state
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return; // Stop execution
        }
        // Try to get error details from response body
        let errorDetails = "Unknown server error";
        try {
            const errorData = await response.json();
            errorDetails = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch (e) {
            errorDetails = `HTTP error ${response.status} ${e}`;
        }
        console.error("Error creating appointment:", errorDetails);
        alert(`Failed to create appointment: ${errorDetails}`);
        return; // Keep booking form open potentially?
      }

      // --- Success ---
      console.log("Appointment created successfully!");
      alert("Appointment created successfully!");
      setIsScheduling(false); // Hide the booking component after confirmation
      // Reset selection state
      setSelectedDoctor(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setTriageAdvice(null); // Clear advice that might have triggered scheduling
      // --- ---
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert(`Failed to create appointment. ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsConfirming(false);
    }
  };

  // --- Keep original handlers ---
  const handleDoctorSelected = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
  };
  const handleDateSelected = (date: string) => {
    setSelectedDate(date);
  };
  const handleTimeSelected = (time: string) => {
    setSelectedTime(time);
  };
  // --- ---

  // --- Keep original renderChatContent ---
  const renderChatContent = () => {
    if (section === "history") {
      const selectedRoomChats = chatHistory.find(
        (room) => room.room_number === selectedRoom
      )?.chats;

      return (
        <div className="flex flex-col gap-4 w-full h-full overflow-y-auto p-1"> {/* Added minimal padding */}
          {chatHistory.length > 0 ? (
            selectedRoomChats && selectedRoomChats.length > 0 ? (
              selectedRoomChats
                .sort((a, b) => a.id - b.id) // Ensure sorting by ID (chronological)
                .map((chat) => (
                  <div key={chat.id} className="flex flex-col gap-2">
                    <div className="flex justify-end">
                      <Chat sender="user" message={chat.input_text} />
                    </div>
                    <div className="flex justify-start">
                      <Chat sender="bot" message={chat.model_response} />
                    </div>
                    {/* Optional: Display historical triage advice */}
                    {/* {chat.triage_advice && <div className="text-xs text-gray-500 self-start ml-2">Advice: {chat.triage_advice}</div>} */}
                  </div>
                ))
            ) : (
              <p className="text-gray-500 text-center mt-4">
                {selectedRoom ? `No messages in Room ${selectedRoom}.` : "Select a room to view its history."}
              </p>
            )
          ) : (
            <p className="text-gray-500 text-center mt-4">No chat history available.</p>
          )}
        </div>
      );
    }

    // --- Render current chat ---
    return (
      <>
        {/* Message display area */}
        <div className="flex flex-col gap-4 w-full h-full overflow-y-auto p-1"> {/* Added minimal padding */}
          {messages.map((msg, index) => (
            // Render user/bot messages using Chat component
             <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <Chat sender={msg.sender} message={msg.message} />
             </div>
          ))}
          {/* Loading indicator */}
          {isLoading && <div className="self-center"><Loading /></div>}

          {/* Triage Advice (only show if not currently scheduling) */}
           {triageAdvice === "schedule_appointment" && !isScheduling && (
             <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
               We recommend you see the doctor.{" "}
               <button
                 className="text-blue-600 underline font-semibold hover:text-blue-800"
                 onClick={() => setIsScheduling(true)} // Show the Appointment component
                 disabled={isConfirming} // Disable while an appointment confirmation is in progress
               >
                 Schedule an appointment now!
               </button>
             </div>
           )}
            {/* Show other triage advice types if needed */}
            {/* {triageAdvice && triageAdvice !== "schedule_appointment" && ( ... )} */}
        </div>

        {/* Input area */}
        <div className="flex flex-row gap-4 w-full h-[48px] mt-auto pt-2 border-t border-black/10"> {/* Added pt-2 and border */}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {if (e.key === 'Enter' && !isLoading && !isConfirming) handleSendMessage()}} // Send on Enter
            type="text"
            placeholder="Type a message"
            className="flex-grow h-full border border-[#ABAEC2] text-black bg-white rounded-lg px-4 focus:outline-none focus:ring-1 focus:ring-blue-500" // Adjusted focus style
            disabled={isLoading || isConfirming} // Disable input while loading/confirming
          />
          <button
            className="w-[48px] h-full bg-blue-600 text-white rounded-lg p-2 flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50" // Use primary color, adjust styling
            onClick={handleSendMessage}
            disabled={isLoading || isConfirming || !input.trim()} // Also disable if input is empty
          >
            <Image
              src="/images/Send.png" // Ensure this path is correct
              width={20}
              height={20}
              alt="send"
              // className="w-full" // Removed w-full if image has intrinsic size
            />
          </button>
        </div>
      </>
    );
  };
  // --- End renderChatContent ---


  // --- Return Original JSX Structure ---
  return (
    <div className="flex flex-col justify-start min-h-screen font-[family-name:var(--font-geist-sans)] p-6 gap-4">
      <div className="flex flex-row items-center justify-between h-[78px] w-full">
        <div className="flex flex-col">
          {/* Use firstName from state */}
          <p className="text-[20px] text-[#747474]">Hi, {firstName || "there"}!</p>
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
             // Pass other necessary props if BookingBox needs them
             // e.g., token={token} if it fetches doctors
             // onConfirm={handleConfirmAppointment} // Pass the confirm handler
             // isConfirming={isConfirming} // Pass loading state
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
            <div className="flex flex-row justify-start items-start gap-8 pt-4"> {/* Added padding top */}
              {/* Section Tabs */}
              <div className="flex flex-col">
                <div className="text-sm font-medium text-black mb-2">
                  Section
                </div>
                <div
                  className="inline-flex border border-[#ABAEC2] rounded-lg p-1" // Use inline-flex
                  role="tablist"
                >
                  <button
                    role="tab"
                    aria-selected={section === "chatbot"}
                    onClick={() => setSection("chatbot")}
                    className={`px-4 py-2 text-sm rounded-md transition-colors ${ // Adjusted padding/text size
                      section === "chatbot"
                        ? "bg-blue-600 text-white shadow-sm" // Use primary color
                        : "bg-white text-[#747474] hover:bg-gray-100"
                    }`}
                  >
                    Chatbot
                  </button>
                  <button
                    role="tab"
                    aria-selected={section === "history"}
                    onClick={() => setSection("history")}
                    className={`px-4 py-2 text-sm rounded-md transition-colors ${ // Adjusted padding/text size
                      section === "history"
                        ? "bg-blue-600 text-white shadow-sm" // Use primary color
                        : "bg-white text-[#747474] hover:bg-gray-100"
                    }`}
                     disabled={chatHistory.length === 0} // Disable if no history
                  >
                    See history
                  </button>
                </div>
              </div>

              {/* Select Room Dropdown */}
              {section === "history" && chatHistory.length > 0 && (
                <div className="flex flex-col">
                  <label htmlFor="room-select" className="text-sm font-medium text-black mb-2"> {/* Use label */}
                    Chat room
                  </label>
                  <select
                    id="room-select"
                    value={selectedRoom ?? ""} // Handle null value for controlled component
                    onChange={(e) => {
                        const val = e.target.value;
                        setSelectedRoom(val ? Number(val) : null); // Handle empty selection if needed
                    }}
                    // Adjusted styling for consistency
                    className="w-[250px] h-[42px] border border-[#ABAEC2] text-[#747474] rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white"
                  >
                     {/* Optional: Add a default placeholder option */}
                     {/* <option value="" disabled>Select a room</option> */}
                    {chatHistory.map((room) => (
                      <option key={room.room_number} value={room.room_number}>
                        Room {room.room_number}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Chat Content Wrapper */}
            <div className="flex flex-col flex-grow gap-4 p-4 mt-4 bg-gray-100 rounded-lg border border-black/10 min-h-[450px] overflow-hidden"> {/* Adjusted bg, min-height, border */}
              {/* Render chat content / history */}
              {token === null && section === 'chatbot' && !isLoading ? (
                  <p className="text-center text-gray-500 mt-10">Initializing chat...</p>
              ) : (
                  renderChatContent()
              )}
            </div>
          </>
        )}
      </div>

       {/* Footer Buttons outside the white box */}
        <div className="flex flex-row justify-end gap-6 w-full mt-4"> {/* Use justify-end */}
           {/* New Chat Button - Always available? Or only in chatbot mode? */}
           {/* Consider placement based on UX */}
           {!isScheduling && (
              <button
                className="px-5 py-2 h-[48px] text-[#232323] border border-[#ABAEC2] rounded-lg font-medium bg-white hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400" // Adjusted styling
                onClick={handleNewChat}
                disabled={isLoading || isConfirming} // Disable while loading state is active
              >
                New Chat
              </button>
           )}

          {isScheduling ? (
            // Confirm Button (only when scheduling)
            <button
              className="px-5 py-2 h-[48px] bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50" // Use primary color
              onClick={handleConfirmAppointment}
              // Disable if confirming or if required fields aren't selected
              disabled={isConfirming || !selectedDoctor || !selectedDate || !selectedTime}
            >
              {isConfirming ? <Loading /> : 'Confirm'} {/* Show loading inside button */}
            </button>
          ) : (
             // Schedule Appointment Button (only when not scheduling)
             // Consider only showing if triageAdvice recommends it, or always allow scheduling
            <button
              className="px-5 py-2 h-[48px] bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50" // Use primary color
              onClick={() => setIsScheduling(true)} // Toggle BookingBox
              disabled={isLoading || isConfirming} // Disable if chatbot is busy
            >
              Schedule Appointment
            </button>
          )}
        </div>
    </div>
  );
}
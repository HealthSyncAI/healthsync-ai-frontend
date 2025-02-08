"use client";
import Image from "next/image";
import Chat from "@/components/Chat-bot";
import { useState } from "react";

export default function Chatbot() {
  const initialMessage = { sender: "bot", message: "Hello, how can I help you?" };
  const [messages, setMessages] = useState<
    { sender: string; message: string }[]
  >([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add the user's message to the chat
    setMessages((prev) => [...prev, { sender: "user", message: input }]);
    
    // Show loading state
    setIsLoading(true);

    try {
      // Make the API call
      const response = await fetch(
        "http://localhost:8000/api/chatbot/symptom",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzM5MDEwMTA0fQ.cyVXqqPWrrZ0xpSFQE_I8qXn02abtZRndH5iCXG5v_M",
          },
          body: JSON.stringify({ symptom_text: input }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch response from the server");
      }
      const data = await response.json();

      // Add the bot's response to the chat
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          message: data.analysis || "No response from the bot.",
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", message: "Something went wrong. Please try again." },
      ]);
    } finally {
      // Hide loading state
      setIsLoading(false);
    }

    // Clear the input field
    setInput("");
  };

  const handleEndChat = () => {
    // Reset messages to initial state
    setMessages([initialMessage]);
    // Clear input field
    setInput("");
    // Reset loading state
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col justify-start min-h-screen font-[family-name:var(--font-geist-sans)] p-6 gap-4">
      {/* Top Section */}
      <div className="flex flex-row items-center justify-between h-[78px] w-full">
        <div className="flex flex-col">
          <p className="text-[20px] text-[#747474]">Hi, Jane Doe!</p>
          <p className="text-[32px] font-bold text-[#232323]">Online Consult</p>
        </div>
      </div>

      {/* Main Section */}
      <div className="flex flex-col gap-4 p-6 w-full min-h-[774px] bg-white rounded-[12px] border-[1px] border-black/10">
        <div className="">
          <h1 className="text-[24px] font-bold text-[#333]">Chatbot</h1>
          <p className="text-[16px] text-[#747474]">
            Ask any questions you have
          </p>
        </div>
        <div className="flex flex-col gap-4 w-full h-[57px] mt-6">
          <div>Section</div>
        </div>
        <div className="flex flex-col gap-4 p-4 w-full h-[524px] mt-auto bg-gray rounded-[12px] border-[1px] border-black/10">
          <div className="flex flex-col gap-4 w-full h-full overflow-y-auto">
            {messages.map((msg, index) => (
              <Chat key={index} sender={msg.sender} message={msg.message} />
            ))}
            {isLoading && (
              <div className="flex items-start max-w-[70%]">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" 
                         style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" 
                         style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" 
                         style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* input */}
          <div className="flex flex-row gap-4 w-full h-[48px] mt-auto">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              type="text"
              placeholder="Type a message"
              className="w-full h-full border-[1px] text-black bg-gray border-[#ABAEC2] rounded-[8px] px-4"
              disabled={isLoading}
            />
            <button
              className="w-[48px] h-full bg-gray text-white rounded-[8px] p-2 border-[1px] border-[#ABAEC2]"
              onClick={handleSendMessage}
              disabled={isLoading}
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
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-row gap-6 w-[451px] h-[48px] ml-auto mt-6">
        <button className="w-full h-full text-[#232323] border-[1px] border-[#ABAEC2] rounded-[8px]">
          Report problem
        </button>
        <button 
          className="w-full h-full bg-primary text-white rounded-[8px]"
          onClick={handleEndChat}
        >
          End
        </button>
      </div>
    </div>
  );
}
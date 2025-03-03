"use client";
import Image from "next/image";
import Chat from "@/components/Chat-bot";
import { useState, useEffect } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import Loading from "@/components/Loading";

interface ChatHistory {
  id: number;
  input_text: string;
  model_response: string;
  triage_advice: string | null;
  created_at: string;
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
  const [section, setSection] = useState("chatbot");
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

  useEffect(() => {
    if (section === "history") {
      fetchChatHistory();
    }
  }, [section]);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/chatbot/chats", {
        headers: {
          Authorization:
            "Bearer " + process.env.NEXT_PUBLIC_TOKEN,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch chat history");
      }
      const data = await response.json();
      // Store the chat history in reverse order
      setChatHistory(data.reverse());
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
            Authorization:
              "Bearer " + process.env.NEXT_PUBLIC_TOKEN,
          },
          body: JSON.stringify({ symptom_text: input }),
        }
      );

      if (!response.ok) {
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

  const handleEndChat = () => {
    setMessages([initialMessage]);
    setInput("");
    setIsLoading(false);
  };

  const renderChatContent = () => {
    if (section === "history") {
      return (
        <div className="flex flex-col gap-4 w-full h-full overflow-y-auto">
          {chatHistory.map((chat) => (
            <div key={chat.id} className="flex flex-col gap-2">
              <div className="flex justify-end">
                <Chat sender="user" message={chat.input_text} />
              </div>
              <div className="flex justify-start">
                <Chat sender="bot" message={chat.model_response} />
              </div>
            </div>
          ))}
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
      </>
    );
  };

  return (
    <div className="flex flex-col justify-start min-h-screen font-[family-name:var(--font-geist-sans)] p-6 gap-4">
      <div className="flex flex-row items-center justify-between h-[78px] w-full">
        <div className="flex flex-col">
          <p className="text-[20px] text-[#747474]">Hi, Jane Doe!</p>
          <p className="text-[32px] font-bold text-[#232323]">Online Consult</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6 w-full min-h-[774px] bg-white rounded-[12px] border-[1px] border-black/10">
        <div className="">
          <h1 className="text-[24px] font-bold text-[#333]">Chatbot</h1>
          <p className="text-[16px] text-[#747474]">
            Ask any questions you have
          </p>
        </div>
        <div className="flex flex-col gap-4 w-full h-[57px] mt-6">
          <div>Section</div>
          <Tabs
            key="section"
            aria-label="Tabs sizes"
            size="sm"
            classNames={{
              tabList: "border border-[#ABAEC2] rounded-[8px] p-1 w-[250px]",
              tab: "px-4 py-2 text-[#747474] rounded-[8px] cursor-pointer data-[selected=true]:bg-primary data-[selected=true]:text-white",
            }}
            onSelectionChange={(key) => setSection(key as string)}
          >
            <Tab key="chatbot" title="Chatbot" />
            <Tab key="history" title="See history" />
          </Tabs>
        </div>
        <div className="flex flex-col gap-4 p-4 w-full h-[524px] mt-auto bg-gray rounded-[12px] border-[1px] border-black/10">
          {renderChatContent()}
        </div>
      </div>

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

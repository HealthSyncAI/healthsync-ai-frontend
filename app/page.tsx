// app/page.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { LoginForm } from "@/components/login-form";
import RegisterForm from "@/components/register-form";

export default function Home() {
  const [showLoginForm, setShowLoginForm] = useState(true);

  const handleLoginClick = () => {
    setShowLoginForm(true);
  };

  const handleRegisterClick = () => {
    setShowLoginForm(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
      {/* Left Section */}
      <div className="relative w-1/2 h-full overflow-visible">
        {/* Frame Image */}
        <Image
          src="/images/Frame.png"
          alt="frame-login"
          width={710}
          height={1024}
          className="w-full h-full object-cover"
        />
        {/* Doctors Image */}
        <Image
          src="/images/doctors-login.png"
          alt="doctors-login"
          width={933}
          height={720}
          className="absolute bottom-0 left-0 w-[850px] max-w-none z-10 object-contain"
        />
      </div>

      {/* Right Section */}
      <div className="flex flex-col items-center justify-center w-1/2">
        <div className="flex flex-row gap-2">
          <h1 className="text-4xl font-bold text-center text-[#333]">
            Welcome to{" "}
          </h1>
          <h1 className="text-4xl font-bold text-center text-primary">
            HealthSync!
          </h1>
        </div>
        <p className="text-lg text-[#333]">
          Quickly schedule an appointment with a doctor
        </p>

        {/* Login/Register Links */}
        <div className="mt-4 flex gap-4">
          <button
            onClick={handleLoginClick}
            className={`text-blue-500 hover:underline ${
              showLoginForm ? "font-semibold" : ""
            }`}
          >
            Login
          </button>
          <button
            onClick={handleRegisterClick}
            className={`text-blue-500 hover:underline ${
              !showLoginForm ? "font-semibold" : ""
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Content */}
        <div className="mt-8 w-full max-w-md">
          {showLoginForm ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}
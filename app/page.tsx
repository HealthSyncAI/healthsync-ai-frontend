import Image from "next/image";

export default function Home() {
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
            Next.js!
          </h1>
        </div>
        <p className="text-lg text-[#333]">
          Quickly schedule an appointment with a doctor
        </p>

        {/* Log in with Google Button */}
        <button className="mt-8 flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-md border-[1px] boder-[#E5E5E5] hover:cursor-pointer">
          <Image
            src="/images/google-icon.png" // Replace with the path to your Google icon
            alt="Google Icon"
            width={22}
            height={22}
            className="object-contain"
          />
          Log in with Google
        </button>
      </div>
    </div>
  );
}
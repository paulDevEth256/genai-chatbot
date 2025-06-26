import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex items-center justify-center">
        <Image
          src="/chatbot.png"
          alt="Logo"
          width={100}
          height={100}
          className="h-16 w-16 rounded-2xl"
        />
      </div>
      <h1 className="text-4xl font-bold text-center">
        Welcome to the GenAI Chatbot!
      </h1>
      <p className="text-lg text-center">
        This is a simple chatbot application built with Next.js and React.
      </p>
      <div className="flex items-center justify-center">
        <Image
          src="/chatbot.png"
          alt="Chatbot Image"
          width={300}
          height={300}
          className="rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
}

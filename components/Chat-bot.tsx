import ReactMarkdown from 'react-markdown';

interface ChatbotProps {
  sender: string;
  message: string;
}

export default function Chatbot({ sender, message }: ChatbotProps) {
  return (
    <div 
      className={`max-w-[824px] px-4 py-2 border border-gray-300 text-[14px] ${
        sender === "bot" 
          ? "bg-white border-[#ABAEC2] rounded-tl-[20px] rounded-r-[20px] mr-auto" 
          : "bg-primary rounded-tr-[20px] rounded-l-[20px] ml-auto text-white"
      }`}
    >
      <ReactMarkdown
        className={`${sender === "bot" ? "text-[#434966]" : "text-white"}`}
        components={{
          // Preserve paragraph spacing
          p: ({children}) => (
            <p className="my-1">{children}</p>
          ),
          // Style links
          a: ({children, href}) => (
            <a 
              href={href}
              className={`underline hover:opacity-80 ${
                sender === "bot" ? "text-blue-600" : "text-white"
              }`} 
            >
              {children}
            </a>
          ),
          // Style lists
          ul: ({children}) => (
            <ul className="list-disc pl-4 my-2">{children}</ul>
          ),
          ol: ({children}) => (
            <ol className="list-decimal pl-4 my-2">{children}</ol>
          ),
          // Style inline code and code blocks
          code: ({children, className}) => {
            const isInline = !className;
            return (
              <code 
                className={`${isInline ? `px-1 py-0.5 rounded ${
                  sender === "bot" 
                    ? "bg-gray-100" 
                    : "bg-white/20"
                }` : ''}`}
              >
                {children}
              </code>
            );
          },
          // Style code blocks
          pre: ({children}) => (
            <pre 
              className={`p-3 rounded my-2 overflow-x-auto ${
                sender === "bot" 
                  ? "bg-gray-100" 
                  : "bg-white/10"
              }`}
            >
              {children}
            </pre>
          ),
          // Style headings
          h1: ({children}) => (
            <h1 className="text-lg font-bold my-2">{children}</h1>
          ),
          h2: ({children}) => (
            <h2 className="text-base font-bold my-2">{children}</h2>
          ),
          h3: ({children}) => (
            <h3 className="text-sm font-bold my-2">{children}</h3>
          ),
          // Style blockquotes
          blockquote: ({children}) => (
            <blockquote 
              className={`border-l-4 pl-4 my-2 ${
                sender === "bot" 
                  ? "border-gray-300" 
                  : "border-white/30"
              }`} 
            >
              {children}
            </blockquote>
          ),
        }}
      >
        {message}
      </ReactMarkdown>
    </div>
  );
}
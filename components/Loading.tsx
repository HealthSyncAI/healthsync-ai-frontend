export default function Loading() {
    return (
        <div className="flex items-start max-w-[70%]">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
    );
    }
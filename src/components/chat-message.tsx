import { cn } from "../lib/utils";
import type { ChannelMessage } from "../hooks/use-realtime-chat";

interface ChatMessageItemProps {
  message: ChannelMessage;
  isOwnMessage: boolean;
  showHeader: boolean;
}

export const ChatMessageItem = ({
  message,
  isOwnMessage,
  showHeader,
}: ChatMessageItemProps) => {
  return (
    <div
      className={`flex mt-1 sm:mt-2 px-2 sm:px-0 ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      <div
        className={cn("max-w-[85%] sm:max-w-[75%] w-fit flex flex-row justify-center gap-2 sm:gap-3", {
          "flex-row-reverse": isOwnMessage,
        })}
      >
        <div className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
          {showHeader && message.user && (
            <img
              src={message.user.avatar_url}
              alt={message.user.name}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
            />
          )}
          {showHeader && !message.user && (
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs sm:text-sm text-gray-600">?</span>
            </div>
          )}
        </div>
        <div className="flex-col justify-start min-w-0">
          {showHeader && message.user && (
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <span className="font-semibold text-gray-900">
                {message.user.name}
              </span>
              <span className="text-xs sm:text-sm text-gray-500">
                {new Date(message?.created_at).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          )}
          {showHeader && !message.user && (
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <span className="font-semibold text-gray-500">Unknown User</span>
              <span className="text-xs sm:text-sm text-gray-500">
                {new Date(message?.created_at).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          )}
          <div className={cn({ "flex justify-end": isOwnMessage })}>
            <div
              className={cn(
                "py-2 px-3 rounded-xl text-sm sm:text-base w-fit break-words",
                isOwnMessage
                  ? "text-right bg-gray-800 text-white"
                  : "bg-slate-200 text-black"
              )}
            >
              {message.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

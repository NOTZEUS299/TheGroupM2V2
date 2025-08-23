import { cn } from "../lib/utils";
import { ChatMessageItem } from "./chat-message";
import { useChatScroll } from "../hooks/use-chat-scroll";
import {
  // type ChatMessage,
  type ChannelMessage,
  useRealtimeChat,
} from "../hooks/use-realtime-chat";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase, type User as UserObj } from "../lib/supabase";

interface RealtimeChatProps {
  channel_id: string;
  roomName: string;
  onMessage?: any;
  user: UserObj;
  messages?: ChannelMessage[];
}

/**
 * Realtime chat component
 * @param roomName - The name of the room to join. Each room is a unique chat.
 * @param username - The username of the user
 * @param onMessage - The callback function to handle the messages. Useful if you want to store the messages in a database.
 * @param messages - The messages to display in the chat. Useful if you want to display messages from a database.
 * @returns The chat component
 */
export const RealtimeChat = ({
  channel_id,
  roomName,
  user,
  onMessage,
  messages: initialMessages = [],
}: RealtimeChatProps) => {
  const { containerRef, scrollToBottom } = useChatScroll();

  const {
    messages: realtimeMessages,
    sendMessage,
    isConnected,
  } = useRealtimeChat({
    roomName,
    user,
  });
  const [newMessage, setNewMessage] = useState("");
  const [lastMessageTime, setLastMessageTime] = useState(0);

  // Merge realtime messages with initial messages
  const allMessages = useMemo(() => {
    const mergedMessages = [...initialMessages, ...realtimeMessages];
    // Remove duplicates based on message id
    const uniqueMessages = mergedMessages.filter(
      (message, index, self) =>
        index === self.findIndex((m) => m?.id === message?.id)
    );
    // Sort by creation date
    const sortedMessages = uniqueMessages.sort((a, b) =>
      a.created_at.localeCompare(b.created_at)
    );

    return sortedMessages;
  }, [initialMessages, realtimeMessages]);

  useEffect(() => {
    if (onMessage) {
      onMessage(allMessages);
    }
  }, [allMessages, onMessage]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [allMessages, scrollToBottom]);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!newMessage.trim() || !isConnected || !user.id || !roomName) return;

      const now = Date.now();
      if (now - lastMessageTime < 1000) {
        return;
      }

      const content = newMessage?.trim();
      sendMessage(newMessage);
      try {
        console.log("Sending Message:", {
          content,
          channel_id,
          user: user.id,
        });
        const { error } = await supabase.from("messages").insert({
          channel_id,
          user_id: user.id,
          content,
        });
        if (error) {
          console.error("Error sending message:", error);
          setNewMessage(content);
        } else {
          console.log("Message sent successfully");
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setNewMessage(content);
      } finally {
        setNewMessage("");
      }
    },
    [newMessage, isConnected, sendMessage]
  );

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground antialiased min-h-0">
      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4 min-h-0">
        {allMessages.length === 0 ? (
          <div className="text-center text-sm sm:text-base text-muted-foreground p-4">
            No messages yet. Start the conversation!
          </div>
        ) : null}
        <div className="space-y-1 sm:space-y-2">
          {allMessages.map((message, index) => {
            const prevMessage = index > 0 ? allMessages[index - 1] : null;
            const showHeader =
              !prevMessage || prevMessage?.user_id !== message?.user_id;
            return (
              <div
                key={message?.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                <ChatMessageItem
                  message={message}
                  isOwnMessage={message?.user?.name === user.name}
                  showHeader={showHeader}
                />
              </div>
            );
          })}
        </div>
      </div>

      <form
        onSubmit={handleSendMessage}
        className="flex w-full gap-2 border-t border-border p-3 sm:p-4 bg-white"
      >
        <Input
          className={cn(
            "rounded-full bg-background text-sm sm:text-base transition-all duration-300 min-w-0",
            isConnected && newMessage.trim() ? "w-[calc(100%-36px)]" : "w-full"
          )}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        {isConnected && newMessage.trim() && (
          <Button
            className="aspect-square rounded-full animate-in fade-in slide-in-from-right-4 duration-300 flex-shrink-0"
            type="submit"
            disabled={!isConnected}
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        )}
      </form>
    </div>
  );
};

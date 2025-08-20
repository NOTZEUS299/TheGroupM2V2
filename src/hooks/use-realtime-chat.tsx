import { createClient } from "../lib/client";
import { type User as UserObj } from "../lib/supabase";
import { useCallback, useEffect, useState } from "react";

interface UseRealtimeChatProps {
  roomName: string;
  username: string;
}

// export interface ChatMessage {
//   id: string
//   content: string
//   user: {
//     name: string
//   }
//   created_at: string
// }

export interface ChannelMessage {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: UserObj;
}

const EVENT_MESSAGE_TYPE = "message";

export function useRealtimeChat({ roomName, username }: UseRealtimeChatProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [channel, setChannel] = useState<ReturnType<
    typeof supabase.channel
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newChannel = supabase.channel(roomName);

    newChannel
      .on("broadcast", { event: EVENT_MESSAGE_TYPE }, (payload) => {
        setMessages((current) => [
          ...current,
          payload.payload as ChannelMessage,
        ]);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
        }
      });

    setChannel(newChannel);

    return () => {
      supabase.removeChannel(newChannel);
    };
  }, [roomName, username, supabase]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!channel || !isConnected) return;

      const message: any = {
        id: crypto.randomUUID(),
        content,
        user: {
          name: username,
        },
        created_at: new Date().toISOString(),
      };

      // Update local state immediately for the sender
      setMessages((current) => [...current, message]);

      await channel.send({
        type: "broadcast",
        event: EVENT_MESSAGE_TYPE,
        payload: message,
      });
    },
    [channel, isConnected, username]
  );

  return { messages, sendMessage, isConnected };
}

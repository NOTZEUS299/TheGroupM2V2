import React, { useEffect, useRef } from 'react';
import { type Message } from '../lib/supabase';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
}

export function MessageList({ messages, loading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium mb-2">No messages yet</p>
          <p className="text-sm">Be the first to start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const showAvatar = index === 0 || messages[index - 1].user_id !== message.user_id;
        const showName = showAvatar;
        
        return (
          <div key={message.id} className={`flex gap-3 ${showAvatar ? 'mt-4' : 'mt-1'}`}>
            <div className="w-8 h-8 flex-shrink-0">
              {showAvatar && message.user && (
                <img
                  src={message.user.avatar_url}
                  alt={message.user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {showName && message.user && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{message.user.name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              )}
              <div className="text-gray-900 whitespace-pre-wrap break-words">
                {message.content}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
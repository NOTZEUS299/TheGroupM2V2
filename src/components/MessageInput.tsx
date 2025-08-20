import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { supabase, type User, type Channel } from '../lib/supabase';

interface MessageInputProps {
  currentUser: User | null;
  currentChannel: Channel | null;
}

export function MessageInput({ currentUser, currentChannel }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !currentUser || !currentChannel || sending) {
      return;
    }

    setSending(true);

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          channel_id: currentChannel.id,
          user_id: currentUser.id,
          content: message.trim()
        });

      if (error) {
        console.error('Error sending message:', error);
      } else {
        setMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!currentUser || !currentChannel) {
    return (
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-center text-gray-500">
          Select a user and channel to start messaging
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${currentChannel.name}`}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={1}
            style={{
              minHeight: '48px',
              maxHeight: '120px',
              resize: 'none'
            }}
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
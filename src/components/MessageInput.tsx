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
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !currentUser || !currentChannel || sending) {
      return;
    }

    // Prevent spam - limit to one message per second
    const now = Date.now();
    if (now - lastMessageTime < 1000) {
      return;
    }

    setSending(true);
    const messageContent = message.trim();
    setMessage(''); // Clear input immediately for better UX

    try {
      console.log('Sending message:', {
        content: messageContent,
        channel_id: currentChannel.id,
        user_id: currentUser.id
      });
      
      const { error } = await supabase
        .from('messages')
        .insert({
          channel_id: currentChannel.id,
          user_id: currentUser.id,
          content: messageContent
        });

      if (error) {
        console.error('Error sending message:', error);
        // Restore message on error
        setMessage(messageContent);
      } else {
        console.log('Message sent successfully');
        setLastMessageTime(now);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message on error
      setMessage(messageContent);
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
      <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-center text-gray-500">
          Select a user and channel to start messaging
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
      <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Type a message in #${currentChannel.name}...`}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
            rows={1}
            disabled={sending}
            style={{
              minHeight: '40px',
              maxHeight: '120px',
              resize: 'none'
            }}
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center flex-shrink-0"
        >
          {sending ? (
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
      </form>
      <div className="text-xs sm:text-sm text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</div>
    </div>
  );
}
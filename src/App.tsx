import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { useUsers, useChannels, useMessages } from './hooks/useSupabase';
import { UserSwitcher } from './components/UserSwitcher';
import { ChannelList } from './components/ChannelList';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import { type User, type Channel } from './lib/supabase';

function App() {
  const { users, loading: usersLoading } = useUsers();
  const { channels, loading: channelsLoading } = useChannels();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const { messages, loading: messagesLoading } = useMessages(currentChannel?.id || null);

  // Auto-select first user and channel when they load
  useEffect(() => {
    if (users.length > 0 && !currentUser) {
      setCurrentUser(users[0]);
    }
  }, [users, currentUser]);

  useEffect(() => {
    if (channels.length > 0 && !currentChannel) {
      setCurrentChannel(channels[0]);
    }
  }, [channels, currentChannel]);

  const isLoading = usersLoading || channelsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">Loading Chat...</p>
          <p className="text-gray-600">Setting up your real-time chat experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">TeamChat</h1>
          </div>
          <UserSwitcher 
            users={users}
            currentUser={currentUser}
            onUserChange={setCurrentUser}
          />
        </div>

        {/* Channels */}
        <div className="flex-1 p-4 overflow-y-auto">
          <ChannelList
            channels={channels}
            currentChannel={currentChannel}
            onChannelChange={setCurrentChannel}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="text-xs text-gray-500 text-center">
            Real-time chat powered by Supabase
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatHeader currentChannel={currentChannel} />
        <MessageList messages={messages} loading={messagesLoading} />
        <MessageInput currentUser={currentUser} currentChannel={currentChannel} />
      </div>
    </div>
  );
}

export default App;
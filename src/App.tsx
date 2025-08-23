import React, { useState } from "react";
import { MessageSquare } from "lucide-react";
import { useChannels, useMessages } from "./hooks/useSupabase";
import { useAuth } from "./hooks/useAuth";
import { AuthForm } from "./components/auth/AuthForm";
import { UserSwitcher } from "./components/UserSwitcher";
import { ChannelList } from "./components/ChannelList";
import { ChatHeader } from "./components/ChatHeader";
import { MessageInput } from "./components/MessageInput";
import { type Channel } from "./lib/supabase";
import { RealtimeChat } from "./components/realtime-chat";

function App() {
  const { user, loading: authLoading, signIn, signUp, signOut, updateProfile } = useAuth();
  const { channels, loading: channelsLoading, error: channelsError } = useChannels();
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authError, setAuthError] = useState('');
  const {
    messages,
    loading: messagesLoading,
    isConnected,
  } = useMessages(currentChannel?.id || null);

  // Auto-select first channel when they load
  React.useEffect(() => {
    if (channels.length > 0 && !currentChannel) {
      setCurrentChannel(channels[0]);
    }
  }, [channels, currentChannel]);

  const handleSignIn = async (email: string, password: string) => {
    try {
      setAuthError('');
      await signIn(email, password);
    } catch (error: any) {
      setAuthError(error.message);
      throw error;
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    try {
      setAuthError('');
      await signUp(email, password, name);
    } catch (error: any) {
      setAuthError(error.message);
      throw error;
    }
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="text-center">
          <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            Loading...
          </p>
          <p className="text-sm sm:text-base text-gray-600">
            Setting up your chat experience
          </p>
        </div>
      </div>
    );
  }

  // Show auth form if not authenticated
  if (!user) {
    return (
      <AuthForm
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        loading={false}
      />
    );
  }

  // Show loading screen while channels are loading
  if (channelsLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="text-center">
          <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            Loading Chat...
          </p>
          <p className="text-sm sm:text-base text-gray-600">
            Setting up your real-time chat experience
          </p>
          {channelsError && (
            <p className="text-sm text-red-600 mt-2">
              Error: {channelsError}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Show error if channels failed to load
  if (channelsError && channels.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="text-center">
          <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-red-600 mx-auto mb-4" />
          <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            Failed to Load Channels
          </p>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            {channelsError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex relative">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-80 
        bg-gray-50 border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:w-80
      `}>
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600" />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">TeamChat</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <UserSwitcher
            user={user}
            onSignOut={signOut}
            onUpdateProfile={updateProfile}
          />
        </div>

        {/* Channels */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
          <ChannelList
            channels={channels}
            currentChannel={currentChannel}
            onChannelChange={(channel) => {
              setCurrentChannel(channel);
              setSidebarOpen(false); // Close sidebar on mobile when channel is selected
            }}
          />
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
          <div className="text-xs sm:text-sm text-gray-500 text-center">
            Real-time chat powered by Supabase
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col lg:ml-0">
        <ChatHeader 
          currentChannel={currentChannel} 
          isConnected={isConnected}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <RealtimeChat
          channel_id={`${currentChannel?.id}`}
          roomName={`${currentChannel?.name}`}
          user={user}
          messages={messages}
        />
      </div>
    </div>
  );
}

export default App;

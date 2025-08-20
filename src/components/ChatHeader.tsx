import React from 'react';
import { Hash, Users, Wifi, WifiOff, Menu } from 'lucide-react';
import { type Channel } from '../lib/supabase';

interface ChatHeaderProps {
  currentChannel: Channel | null;
  isConnected?: boolean;
  onMenuClick?: () => void;
}

export function ChatHeader({ currentChannel, isConnected = false, onMenuClick }: ChatHeaderProps) {
  if (!currentChannel) {
    return (
      <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-6 h-6 rounded bg-gray-200"></div>
          <div className="text-sm sm:text-base text-gray-500">Select a channel</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1 rounded-md hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Hash className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: currentChannel.color }} />
        <div className="flex-1">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{currentChannel.name}</h2>
          {currentChannel.description && (
            <p className="text-xs sm:text-sm text-gray-600 truncate">{currentChannel.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className={`flex items-center gap-1 text-xs ${
            isConnected ? 'text-green-600' : 'text-gray-400'
          }`}>
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
              </>
            ) : (
              <WifiOff className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
            <span className="hidden sm:inline">{isConnected ? 'Live' : 'Offline'}</span>
          </div>
          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">4 members</span>
            <span className="sm:hidden">4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
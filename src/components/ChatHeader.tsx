import React from 'react';
import { Hash, Users, Wifi, WifiOff } from 'lucide-react';
import { type Channel } from '../lib/supabase';

interface ChatHeaderProps {
  currentChannel: Channel | null;
  isConnected?: boolean;
}

export function ChatHeader({ currentChannel, isConnected = false }: ChatHeaderProps) {
  if (!currentChannel) {
    return (
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-gray-200"></div>
          <div className="text-gray-500">Select a channel</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-3">
        <Hash className="w-6 h-6" style={{ color: currentChannel.color }} />
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">{currentChannel.name}</h2>
          {currentChannel.description && (
            <p className="text-sm text-gray-600">{currentChannel.description}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1 text-xs ${
            isConnected ? 'text-green-600' : 'text-gray-400'
          }`}>
            {isConnected ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            <span>{isConnected ? 'Live' : 'Offline'}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>4 members</span>
          </div>
        </div>
      </div>
    </div>
  );
}
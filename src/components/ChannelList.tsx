import React from 'react';
import { Hash } from 'lucide-react';
import { type Channel } from '../lib/supabase';

interface ChannelListProps {
  channels: Channel[];
  currentChannel: Channel | null;
  onChannelChange: (channel: Channel) => void;
}

export function ChannelList({ channels, currentChannel, onChannelChange }: ChannelListProps) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
        Channels
      </h3>
      {channels.map((channel) => (
        <button
          key={channel.id}
          onClick={() => onChannelChange(channel)}
          className={`flex items-center gap-3 w-full p-2 rounded-lg text-left transition-colors ${
            currentChannel?.id === channel.id
              ? 'bg-blue-100 text-blue-900'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <Hash 
            className="w-4 h-4 flex-shrink-0" 
            style={{ color: currentChannel?.id === channel.id ? '#1e40af' : channel.color }}
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{channel.name}</div>
            {channel.description && (
              <div className="text-xs text-gray-500 truncate">{channel.description}</div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
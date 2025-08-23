import React, { useState } from 'react';
import { Settings, LogOut } from 'lucide-react';
import { type User as UserType } from '../lib/supabase';
import { ProfileModal } from './profile/ProfileModal';

interface UserSwitcherProps {
  user: UserType;
  onSignOut: () => void;
  onUpdateProfile: (updates: Partial<UserType>) => Promise<void>;
}

export function UserSwitcher({ user, onSignOut, onUpdateProfile }: UserSwitcherProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <>
      <div className="relative">
        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-white border border-gray-200">
          <img
            src={user.avatar_url}
            alt={user.name}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="text-sm sm:text-base font-medium text-gray-900 block truncate">{user.name}</span>
            <span className="text-xs text-gray-500 block truncate">{user.email}</span>
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <button
              onClick={() => {
                setIsProfileOpen(true);
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full p-3 hover:bg-gray-50 transition-colors text-left rounded-t-lg"
            >
              <Settings className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">Edit Profile</span>
            </button>
            <button
              onClick={() => {
                onSignOut();
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full p-3 hover:bg-gray-50 transition-colors text-left rounded-b-lg border-t border-gray-100"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-600">Sign Out</span>
            </button>
          </div>
        )}
      </div>

      <ProfileModal
        user={user}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onUpdateProfile={onUpdateProfile}
      />
    </>
  );
}
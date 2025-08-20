import React from 'react';
import { User, ChevronDown } from 'lucide-react';
import { type User as UserType } from '../lib/supabase';

interface UserSwitcherProps {
  users: UserType[];
  currentUser: UserType | null;
  onUserChange: (user: UserType) => void;
}

export function UserSwitcher({ users, currentUser, onUserChange }: UserSwitcherProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        {currentUser ? (
          <>
            <img
              src={currentUser.avatar_url}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-medium text-gray-900 flex-1 text-left">{currentUser.name}</span>
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-gray-500 flex-1 text-left">Select User</span>
          </>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                onUserChange(user);
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-medium text-gray-900">{user.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
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
        className="flex items-center gap-2 sm:gap-3 w-full p-2 sm:p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        {currentUser ? (
          <>
            <img
              src={currentUser.avatar_url}
              alt={currentUser.name}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
            />
            <span className="text-sm sm:text-base font-medium text-gray-900 flex-1 text-left truncate">{currentUser.name}</span>
          </>
        ) : (
          <>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
            </div>
            <span className="text-sm sm:text-base text-gray-500 flex-1 text-left">Select User</span>
          </>
        )}
        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                onUserChange(user);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 sm:gap-3 w-full p-2 sm:p-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
              />
              <span className="text-sm sm:text-base font-medium text-gray-900 truncate">{user.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
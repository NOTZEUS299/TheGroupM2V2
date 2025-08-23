import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Link, User } from 'lucide-react';
import { type User } from '../../lib/supabase';

interface ProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (updates: Partial<User>) => Promise<void>;
}

export function ProfileModal({ user, isOpen, onClose, onUpdateProfile }: ProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarUrl(result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onUpdateProfile({
        name: name.trim(),
        avatar_url: avatarUrl
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const generateAvatar = () => {
    const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name + Date.now())}`;
    setAvatarUrl(newAvatarUrl);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadMethod('url')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      uploadMethod === 'url' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('file')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      uploadMethod === 'file' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Upload
                  </button>
                </div>

                {uploadMethod === 'url' ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Enter image URL"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={generateAvatar}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Generate Random Avatar
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      Choose File
                    </button>
                    <p className="text-xs text-gray-500 mt-1">Max 5MB, JPG/PNG</p>
                  </div>
                )}
              </div>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your display name"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
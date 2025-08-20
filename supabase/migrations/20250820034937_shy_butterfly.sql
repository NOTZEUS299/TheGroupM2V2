-- Complete database setup for real-time chat application
-- Run this script in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create channels table
CREATE TABLE IF NOT EXISTS channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  color text NOT NULL DEFAULT '#6366f1',
  created_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (but allow all operations for now)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (you can restrict these later)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on channels" ON channels FOR ALL USING (true);
CREATE POLICY "Allow all operations on messages" ON messages FOR ALL USING (true);

-- Insert the four users with professional avatars
INSERT INTO users (id, name, avatar_url) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Darshan Patel', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Margesh Polara', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Shreyansh Khunt', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Divyesh Zinzuvadiya', 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- Insert the five channels
INSERT INTO channels (id, name, description, color) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Group Chat', 'General discussion for everyone', '#6366f1'),
  ('660e8400-e29b-41d4-a716-446655440002', 'Agency One', 'Private channel for Agency One team', '#ef4444'),
  ('660e8400-e29b-41d4-a716-446655440003', 'Agency Two', 'Private channel for Agency Two team', '#10b981'),
  ('660e8400-e29b-41d4-a716-446655440004', 'Agency Three', 'Private channel for Agency Three team', '#f59e0b'),
  ('660e8400-e29b-41d4-a716-446655440005', 'Agency Four', 'Private channel for Agency Four team', '#8b5cf6')
ON CONFLICT (id) DO NOTHING;

-- Insert some sample messages to get started
INSERT INTO messages (channel_id, user_id, content) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Welcome to our group chat! 👋'),
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Hello everyone! Great to be here.'),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Agency One team, let''s discuss our current projects.'),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Agency Two is ready for the new quarter!'),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Agency Three checking in. How is everyone doing?')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_channels_created_at ON channels(created_at);
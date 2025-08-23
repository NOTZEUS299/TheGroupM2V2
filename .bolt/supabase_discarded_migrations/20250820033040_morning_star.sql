/*
  # Real-time Chat Application Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)
    - `channels`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `color` (text)
      - `created_at` (timestamp)
    - `messages`
      - `id` (uuid, primary key)
      - `channel_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `content` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (demo purposes)
*/

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
  color text DEFAULT '#3B82F6',
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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo app)
CREATE POLICY "Allow public read access to users"
  ON users FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to channels"
  ON channels FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to messages"
  ON messages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to messages"
  ON messages FOR INSERT
  TO public
  WITH CHECK (true);

-- Insert predefined users
INSERT INTO users (id, name, avatar_url) VALUES
  ('d1e2f3a4-b5c6-d7e8-f9a0-b1c2d3e4f5a6', 'Darshan Patel', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('e2f3a4b5-c6d7-e8f9-a0b1-c2d3e4f5a6b7', 'Margesh Polara', 'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('f3a4b5c6-d7e8-f9a0-b1c2-d3e4f5a6b7c8', 'Shreyansh Khunt', 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('a4b5c6d7-e8f9-a0b1-c2d3-e4f5a6b7c8d9', 'Divyesh Zinzuvadiya', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400');

-- Insert predefined channels
INSERT INTO channels (id, name, description, color) VALUES
  ('ch1-group-chat-main-channel-id', 'Group Chat', 'Main discussion channel for everyone', '#3B82F6'),
  ('ch2-agency-one-channel-id-here', 'Agency One', 'Digital marketing and brand strategy', '#10B981'),
  ('ch3-agency-two-channel-id-here', 'Agency Two', 'Creative design and development', '#8B5CF6'),
  ('ch4-agency-three-channel-id-here', 'Agency Three', 'Content creation and social media', '#F59E0B'),
  ('ch5-agency-four-channel-id-here', 'Agency Four', 'Analytics and performance tracking', '#EF4444');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
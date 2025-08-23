@@ .. @@
 -- Create users table
 CREATE TABLE IF NOT EXISTS users (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
+  email text UNIQUE,
   name text NOT NULL,
   avatar_url text NOT NULL,
   created_at timestamptz DEFAULT now()
 );

@@ .. @@
 CREATE POLICY "Users can read own data"
   ON users
   FOR SELECT
-  TO authenticated
-  USING (auth.uid() = id);
+  TO public
+  USING (true);

 CREATE POLICY "Users can update own data"
   ON users
   FOR UPDATE
   TO authenticated
   USING (auth.uid() = id);

+CREATE POLICY "Users can insert own data"
+  ON users
+  FOR INSERT
+  TO authenticated
+  WITH CHECK (auth.uid() = id);

 -- Create channels table
@@ .. @@
 -- Insert sample users with professional avatars
 INSERT INTO users (id, name, avatar_url) VALUES
-  ('550e8400-e29b-41d4-a716-446655440001', 'Darshan Patel', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'),
-  ('550e8400-e29b-41d4-a716-446655440002', 'Margesh Polara', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'),
-  ('550e8400-e29b-41d4-a716-446655440003', 'Shreyansh Khunt', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'),
-  ('550e8400-e29b-41d4-a716-446655440004', 'Divyesh Zinzuvadiya', 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face')
+  ('550e8400-e29b-41d4-a716-446655440001', 'Darshan Patel', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'darshan@example.com'),
+  ('550e8400-e29b-41d4-a716-446655440002', 'Margesh Polara', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 'margesh@example.com'),
+  ('550e8400-e29b-41d4-a716-446655440003', 'Shreyansh Khunt', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'shreyansh@example.com'),
+  ('550e8400-e29b-41d4-a716-446655440004', 'Divyesh Zinzuvadiya', 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face', 'divyesh@example.com')
 ON CONFLICT (id) DO NOTHING;
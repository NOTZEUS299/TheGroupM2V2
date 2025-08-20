import { useState, useEffect } from 'react';
import { supabase, type User, type Channel, type Message } from '../lib/supabase';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    }

    fetchUsers();
  }, []);

  return { users, loading };
}

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChannels() {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('created_at');

      if (error) {
        console.error('Error fetching channels:', error);
      } else {
        setChannels(data || []);
      }
      setLoading(false);
    }

    fetchChannels();
  }, []);

  return { channels, loading };
}

export function useMessages(channelId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!channelId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    async function fetchMessages() {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          user:users(*)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    }

    fetchMessages();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`messages:${channelId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`
      }, async (payload) => {
        // Fetch the complete message with user data
        const { data: newMessage } = await supabase
          .from('messages')
          .select(`
            *,
            user:users(*)
          `)
          .eq('id', payload.new.id)
          .single();

        if (newMessage) {
          setMessages(prev => [...prev, newMessage]);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [channelId]);

  return { messages, loading };
}
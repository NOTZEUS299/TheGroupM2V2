import { useState, useEffect } from 'react';
import { supabase, type User, type Channel, type Message } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

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
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!channelId) {
      setMessages([]);
      setIsConnected(false);
      return;
    }

    // Clear messages when switching channels
    setMessages([]);
    setLoading(false);
    setIsConnected(false);

    // Set up real-time subscription for new messages
    const channel: RealtimeChannel = supabase
      .channel(`messages:${channelId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`
      }, async (payload) => {
        console.log('New message received:', payload);
        
        // Fetch the complete message with user data for real-time display
        const { data: newMessage } = await supabase
          .from('messages')
          .select(`
            *,
            user:users(*)
          `)
          .eq('id', payload.new.id)
          .single();

        if (newMessage) {
          console.log('Adding message to state:', newMessage);
          setMessages(prev => [...prev, newMessage]);
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`
      }, (payload) => {
        console.log('Message deleted:', payload);
        setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
      })
      .on('system', {}, (status, err) => {
        console.log('Realtime status:', status, err);
        setIsConnected(status === 'SUBSCRIBED');
      })
      .subscribe();

    console.log('Subscribed to channel:', channelId);

    return () => {
      console.log('Unsubscribing from channel:', channelId);
      channel.unsubscribe();
    };
  }, [channelId]);

  return { messages, loading, isConnected };
}
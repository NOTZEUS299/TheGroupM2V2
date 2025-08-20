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
    setLoading(true);
    setIsConnected(false);

    // Fetch existing messages first
    async function fetchMessages() {
      try {
        console.log('Fetching messages for channel:', channelId);
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
          console.log('Fetched existing messages:', data?.length || 0);
          setMessages(data || []);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();

    // Set up real-time subscription for new messages
    console.log('Setting up real-time subscription for channel:', channelId);
    
    // const realtimeChannel: RealtimeChannel = supabase
    //   .channel(`public:messages:channel_id=eq.${channelId}`, {
    //     config: {
    //       broadcast: { self: true },
    //       presence: { key: channelId },
    //     },
    //   })
    //   .on('postgres_changes', {
    //     event: 'INSERT',
    //     schema: 'public',
    //     table: 'messages',
    //     filter: `channel_id=eq.${channelId}`
    //   }, async (payload) => {
    //     console.log('New message received:', payload);
        
    //     // Fetch the complete message with user data for real-time display
    //     const { data: newMessage, error } = await supabase
    //       .from('messages')
    //       .select(`
    //         *,
    //         user:users(*)
    //       `)
    //       .eq('id', payload.new.id)
    //       .single();

    //     if (newMessage && !error) {
    //       console.log('Adding message to state:', newMessage);
    //       setMessages(prev => [...prev, newMessage]);
    //     } else if (error) {
    //       console.error('Error fetching new message details:', error);
    //       // Fallback: create message object from payload
    //       const fallbackMessage = {
    //         ...payload.new,
    //         user: null
    //       } as Message;
    //       setMessages(prev => [...prev, fallbackMessage]);
    //     }
    //   })
    //   .on('postgres_changes', {
    //     event: 'DELETE',
    //     schema: 'public',
    //     table: 'messages',
    //     filter: `channel_id=eq.${channelId}`
    //   }, (payload) => {
    //     console.log('Message deleted:', payload);
    //     setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
    //   })
    //   .on('postgres_changes', {
    //     event: 'UPDATE',
    //     schema: 'public',
    //     table: 'messages',
    //     filter: `channel_id=eq.${channelId}`
    //   }, async (payload) => {
    //     console.log('Message updated:', payload);
        
    //     // Fetch the updated message with user data
    //     const { data: updatedMessage, error } = await supabase
    //       .from('messages')
    //       .select(`
    //         *,
    //         user:users(*)
    //       `)
    //       .eq('id', payload.new.id)
    //       .single();

    //     if (updatedMessage && !error) {
    //       setMessages(prev => prev.map(msg => 
    //         msg.id === updatedMessage.id ? updatedMessage : msg
    //       ));
    //     }
    //   })
    //   .on('system', {}, (status) => {
    //     console.log('Realtime connection status:', status);
    //     setIsConnected(status === 'SUBSCRIBED');
    //   })
    //   .subscribe();

    // console.log('Subscribed to realtime channel for:', channelId);

    // return () => {
    //   console.log('Unsubscribing from channel:', channelId);
    //   realtimeChannel.unsubscribe();
    //   setIsConnected(false);
    // };
  }, [channelId]);

  return { messages, loading, isConnected };
}
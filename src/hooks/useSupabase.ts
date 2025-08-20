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
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!channelId) {
      setMessages([]);
      setIsConnected(false);
      return;
    }

    setMessages([]);
    setLoading(true);

    // Fetch existing messages
    async function fetchMessages() {
      try {
        console.log('🔍 Fetching messages for channel:', channelId);
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            user:users(*)
          `)
          .eq('channel_id', channelId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('❌ Error fetching messages:', error);
        } else {
          console.log('✅ Fetched messages:', data?.length || 0);
          setMessages(data || []);
        }
      } catch (error) {
        console.error('❌ Error in fetchMessages:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();

    // Set up real-time subscription
    console.log('🔌 Setting up real-time subscription for channel:', channelId);
    
    const channel = supabase
      .channel(`messages-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          console.log('📨 New message received:', payload);
          
          // Fetch the complete message with user data
          try {
            const { data: newMessage, error } = await supabase
              .from('messages')
              .select(`
                *,
                user:users(*)
              `)
              .eq('id', payload.new.id)
              .single();

            if (newMessage && !error) {
              console.log('✅ Adding message to state:', newMessage);
              setMessages(prev => {
                // Check if message already exists to prevent duplicates
                const exists = prev.some(msg => msg.id === newMessage.id);
                if (exists) {
                  console.log('⚠️ Message already exists, skipping');
                  return prev;
                }
                return [...prev, newMessage];
              });
            } else {
              console.error('❌ Error fetching new message details:', error);
            }
          } catch (error) {
            console.error('❌ Error processing new message:', error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          console.log('🗑️ Message deleted:', payload);
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      )
      .on('subscribe', (status) => {
        console.log('🔌 Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      })
      .subscribe();

    return () => {
      console.log('🔌 Unsubscribing from channel:', channelId);
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [channelId]);

  return { messages, loading, isConnected };
}
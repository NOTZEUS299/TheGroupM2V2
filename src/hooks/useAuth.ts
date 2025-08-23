import { useState, useEffect } from 'react';
import { supabase, type User } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useAuth: Starting authentication check');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('useAuth: Initial session check', { session: !!session, error });
      setSession(session);
      if (session?.user) {
        console.log('useAuth: User found in session, fetching profile');
        fetchUserProfile(session.user.id);
      } else {
        console.log('useAuth: No user in session, setting loading to false');
        setLoading(false);
      }
    }).catch((error) => {
      console.error('useAuth: Error getting initial session:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('useAuth: Auth state changed', { event, session: !!session });
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    console.log('useAuth: Fetching user profile for:', userId);
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('useAuth: Error fetching user profile:', error);
        // If user doesn't exist in users table, create a basic profile
        if (error.code === 'PGRST116') {
          console.log('useAuth: User not found in users table, creating profile');
          const { data: authUser } = await supabase.auth.getUser();
          if (authUser.user) {
            const newUser = {
              id: authUser.user.id,
              name: authUser.user.email?.split('@')[0] || 'User',
              email: authUser.user.email,
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authUser.user.email || 'user')}`
            };
            
            console.log('useAuth: Creating new user profile:', newUser);
            const { error: insertError } = await supabase
              .from('users')
              .insert(newUser);
              
            if (!insertError) {
              console.log('useAuth: User profile created successfully');
              setUser(newUser);
            } else {
              console.error('useAuth: Error creating user profile:', insertError);
            }
          }
        } else {
          console.error('useAuth: Unexpected error fetching user profile:', error);
        }
      } else {
        console.log('useAuth: User profile fetched successfully:', data);
        setUser(data);
      }
    } catch (error) {
      console.error('useAuth: Unexpected error in fetchUserProfile:', error);
    } finally {
      console.log('useAuth: Setting loading to false');
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    console.log('useAuth: Signing up user:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Create user profile
    if (data.user) {
      console.log('useAuth: Creating user profile after signup');
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          name,
          email,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
        });

      if (profileError) throw profileError;
    }

    return data;
  };

  const signIn = async (email: string, password: string) => {
    console.log('useAuth: Signing in user:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    console.log('useAuth: Signing out user');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');

    console.log('useAuth: Updating user profile:', updates);
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    // Update local state
    setUser({ ...user, ...updates });
  };

  return {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };
}
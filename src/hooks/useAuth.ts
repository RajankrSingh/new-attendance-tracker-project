import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  department: string;
  position: string;
  avatar: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, wait a bit for the trigger to create it
        setTimeout(async () => {
          const { data: retryData, error: retryError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (!retryError && retryData) {
            setProfile(retryData);
          } else {
            console.error('Profile still not found after retry:', retryError);
          }
          setLoading(false);
        }, 2000);
      } else {
        setProfile(data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { data, error };
  };

  const signInWithOTP = async (phone: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        data: {
          name: 'Mobile User',
          role: 'user',
          department: 'General',
          position: 'Employee',
        },
      },
    });
    return { data, error };
  };

  const verifyOTP = async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, userData: {
    name: string;
    role?: 'admin' | 'user';
    department?: string;
    position?: string;
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role || 'user',
          department: userData.department || 'General',
          position: userData.position || 'Employee',
        },
      },
    });

    if (error) {
      console.error('Signup error:', error);
      return { data, error };
    }

    console.log('Signup successful:', data);
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signInWithGoogle,
    signInWithOTP,
    verifyOTP,
    signUp,
    signOut,
  };
}
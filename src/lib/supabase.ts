import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'user';
          department: string;
          position: string;
          avatar: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: 'admin' | 'user';
          department?: string;
          position?: string;
          avatar?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'admin' | 'user';
          department?: string;
          position?: string;
          avatar?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendance_records: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          clock_in: string | null;
          clock_out: string | null;
          status: 'present' | 'absent' | 'late' | 'half-day';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          clock_in?: string | null;
          clock_out?: string | null;
          status?: 'present' | 'absent' | 'late' | 'half-day';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          clock_in?: string | null;
          clock_out?: string | null;
          status?: 'present' | 'absent' | 'late' | 'half-day';
          created_at?: string;
          updated_at?: string;
        };
      };
      leave_requests: {
        Row: {
          id: string;
          user_id: string;
          start_date: string;
          end_date: string;
          type: 'sick' | 'vacation' | 'personal';
          status: 'pending' | 'approved' | 'rejected';
          reason: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          start_date: string;
          end_date: string;
          type: 'sick' | 'vacation' | 'personal';
          status?: 'pending' | 'approved' | 'rejected';
          reason: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          start_date?: string;
          end_date?: string;
          type?: 'sick' | 'vacation' | 'personal';
          status?: 'pending' | 'approved' | 'rejected';
          reason?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      leave_balances: {
        Row: {
          id: string;
          user_id: string;
          sick: number;
          vacation: number;
          personal: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          sick?: number;
          vacation?: number;
          personal?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          sick?: number;
          vacation?: number;
          personal?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
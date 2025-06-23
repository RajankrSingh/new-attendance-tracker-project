import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: 'present' | 'absent' | 'late' | 'half-day';
  created_at: string;
  updated_at: string;
}

export function useAttendance(userId?: string) {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchAttendanceRecords();
    }
  }, [userId]);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching attendance records:', error);
      } else {
        setAttendanceRecords(data || []);
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAttendanceRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          *,
          profiles (
            name,
            email,
            position,
            department,
            avatar
          )
        `)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching all attendance records:', error);
      } else {
        setAttendanceRecords(data || []);
      }
    } catch (error) {
      console.error('Error fetching all attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const clockIn = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString('en-US', { hour12: false });

    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .upsert({
          user_id: userId,
          date: today,
          clock_in: now,
          status: 'present',
        }, {
          onConflict: 'user_id,date'
        })
        .select()
        .single();

      if (error) {
        console.error('Error clocking in:', error);
        return { error };
      }

      await fetchAttendanceRecords();
      return { data };
    } catch (error) {
      console.error('Error clocking in:', error);
      return { error };
    }
  };

  const clockOut = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString('en-US', { hour12: false });

    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .update({ clock_out: now })
        .eq('user_id', userId)
        .eq('date', today)
        .select()
        .single();

      if (error) {
        console.error('Error clocking out:', error);
        return { error };
      }

      await fetchAttendanceRecords();
      return { data };
    } catch (error) {
      console.error('Error clocking out:', error);
      return { error };
    }
  };

  const getTodayAttendance = (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return attendanceRecords.find(record => 
      record.user_id === userId && record.date === today
    );
  };

  return {
    attendanceRecords,
    loading,
    clockIn,
    clockOut,
    getTodayAttendance,
    fetchAttendanceRecords,
    fetchAllAttendanceRecords,
  };
}
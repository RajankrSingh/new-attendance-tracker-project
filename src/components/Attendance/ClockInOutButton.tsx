import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAttendance } from '../../hooks/useAttendance';

const ClockInOut: React.FC = () => {
  const { user } = useAuth();
  const { clockIn, clockOut, getTodayAttendance, loading } = useAttendance(user?.id);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayAttendance = user ? getTodayAttendance(user.id) : null;

  const handleClockIn = async () => {
    if (!user) return;
    
    setActionLoading(true);
    try {
      const { error } = await clockIn(user.id);
      if (error) {
        alert('Error clocking in. Please try again.');
      }
    } catch (error) {
      alert('Error clocking in. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!user) return;
    
    setActionLoading(true);
    try {
      const { error } = await clockOut(user.id);
      if (error) {
        alert('Error clocking out. Please try again.');
      }
    } catch (error) {
      alert('Error clocking out. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto border border-gray-100">
      <div className="text-center mb-6">
        <Clock className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Time Tracking</h2>
        <div className="text-3xl font-mono text-indigo-600 font-bold">
          {currentTime.toLocaleTimeString()}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={handleClockIn}
          disabled={!!todayAttendance?.clock_in || actionLoading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {actionLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Clock In
            </>
          )}
        </button>

        <button
          onClick={handleClockOut}
          disabled={!todayAttendance?.clock_in || !!todayAttendance?.clock_out || actionLoading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {actionLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <XCircle className="w-5 h-5" />
              Clock Out
            </>
          )}
        </button>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <h3 className="font-semibold text-gray-900 text-center mb-3">Today's Status</h3>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Status:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              todayAttendance?.status === 'present'
                ? 'bg-green-100 text-green-800'
                : todayAttendance?.status === 'late'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {todayAttendance?.status || 'Not clocked in'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Clock In:</span>
          <span className="text-sm font-mono text-gray-900">
            {todayAttendance?.clock_in ? 
              new Date(`2000-01-01T${todayAttendance.clock_in}`).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }) : '-'
            }
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Clock Out:</span>
          <span className="text-sm font-mono text-gray-900">
            {todayAttendance?.clock_out ? 
              new Date(`2000-01-01T${todayAttendance.clock_out}`).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }) : '-'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClockInOut;
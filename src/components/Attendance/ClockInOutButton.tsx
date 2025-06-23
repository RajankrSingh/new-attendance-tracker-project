import React, { useState, useEffect } from 'react';
import { mockAttendance } from '../../data/mockData';

const ClockInOut: React.FC = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const today = new Date().toISOString().split('T')[0];

  // Load attendance from localStorage for real-time sync
  const getAttendanceArr = () => JSON.parse(localStorage.getItem('mockAttendance') || '[]');

  // Find today's attendance for the current user
  const initialAttendance = getAttendanceArr().find(
    (a: any) => a.userId === currentUser.id && a.date === today
  );

  const [clockInTime, setClockInTime] = useState<string>(initialAttendance?.clockIn || '');
  const [clockOutTime, setClockOutTime] = useState<string>(initialAttendance?.clockOut || '');

  // Update attendance in localStorage (simulate backend)
  const updateAttendance = (clockIn?: string, clockOut?: string) => {
    let arr = getAttendanceArr();
    let updated = false;
    arr = arr.map((att: any) => {
      if (att.userId === currentUser.id && att.date === today) {
        if (clockIn) att.clockIn = clockIn;
        if (clockOut) att.clockOut = clockOut;
        updated = true;
      }
      return att;
    });
    if (!updated) {
      arr.push({
        id: Date.now().toString(),
        userId: currentUser.id,
        date: today,
        status: clockIn ? 'present' : 'absent',
        clockIn: clockIn || '',
        clockOut: clockOut || '',
      });
    }
    localStorage.setItem('mockAttendance', JSON.stringify(arr));
  };

  useEffect(() => {
    // Load from localStorage if available
    const arr = getAttendanceArr();
    const att = arr.find((a: any) => a.userId === currentUser.id && a.date === today);
    if (att) {
      setClockInTime(att.clockIn || '');
      setClockOutTime(att.clockOut || '');
    }
  }, [currentUser.id, today]);

  const handleClockIn = () => {
    const now = new Date().toLocaleTimeString();
    setClockInTime(now);
    updateAttendance(now, undefined);
  };

  const handleClockOut = () => {
    const now = new Date().toLocaleTimeString();
    setClockOutTime(now);
    updateAttendance(undefined, now);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Clock In / Clock Out</h2>
      <div className="mb-4">
        <button
          onClick={handleClockIn}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          disabled={!!clockInTime}
        >
          Clock In
        </button>
        <button
          onClick={handleClockOut}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={!clockInTime || !!clockOutTime}
        >
          Clock Out
        </button>
      </div>
      <div>
        <div>
          <span className="font-medium">Clock In Time:</span> {clockInTime || '-'}
        </div>
        <div>
          <span className="font-medium">Clock Out Time:</span> {clockOutTime || '-'}
        </div>
      </div>
    </div>
  );
};

export default ClockInOut;
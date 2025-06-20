import React from 'react';
import { mockUsers, mockAttendance } from '../../data/mockData';
import ClockInOut from '../Attendance/ClockInOutButton';
import { LogOut } from 'lucide-react';

const UserDashboard: React.FC = () => {
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const today = new Date().toISOString().split('T')[0];

  // Find today's attendance for the current user
  const attendance = mockAttendance.find(
    (a) => a.userId === currentUser.id && a.date === today
  );

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  if (!currentUser || !currentUser.id) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold">User not found</h2>
        <p>Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-100 p-8 flex flex-col items-center">
      <div className="flex items-center justify-between w-full max-w-2xl mb-8">
        <h1 className="text-3xl font-extrabold text-indigo-700 tracking-tight drop-shadow">
          <span className="bg-gradient-to-r from-indigo-500 to-blue-400 bg-clip-text text-transparent">
            Welcome, {currentUser.name}!
          </span>
        </h1>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-2 px-5 rounded-full shadow-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl mb-8">
        <div className="flex items-center mb-6">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-20 w-20 rounded-full mr-6 border-4 border-indigo-200 shadow"
          />
          <div>
            <div className="text-2xl font-bold text-indigo-800">{currentUser.name}</div>
            <div className="text-gray-500">{currentUser.email}</div>
            <div className="text-gray-500">{currentUser.position}</div>
          </div>
        </div>
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2 text-indigo-700">Today's Attendance</h2>
          <div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold shadow ${
                attendance?.status === 'present'
                  ? 'bg-green-100 text-green-800'
                  : attendance?.status === 'late'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {attendance?.status || 'absent'}
            </span>
          </div>
          <div className="mt-2 flex gap-8">
            <div>
              <span className="font-medium text-gray-700">Clock In: </span>
              {attendance?.clockIn || '-'}
            </div>
            <div>
              <span className="font-medium text-gray-700">Clock Out: </span>
              {attendance?.clockOut || '-'}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-2xl">
        <ClockInOut />
      </div>
    </div>
  );
};

export default UserDashboard;
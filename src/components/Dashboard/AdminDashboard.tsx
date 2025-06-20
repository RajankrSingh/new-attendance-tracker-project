import React from 'react';
import { User } from '../../types/types';
import { mockUsers } from '../../data/mockData';
import { Users, UserCheck, UserX, Clock, LogOut } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];

  // Always read latest attendance from localStorage
  const attendanceArr = JSON.parse(localStorage.getItem('mockAttendance') || '[]');

  const totalUsers = mockUsers.length;
  const presentToday = attendanceArr.filter(
    (record: any) => record.date === today && record.status === 'present'
  ).length;
  const lateToday = attendanceArr.filter(
    (record: any) => record.date === today && record.status === 'late'
  ).length;

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-8">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-extrabold text-indigo-700 tracking-tight drop-shadow">
          <span className="bg-gradient-to-r from-indigo-500 to-blue-400 bg-clip-text text-transparent">
            Admin Dashboard
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow-xl p-7 flex flex-col items-center hover:scale-105 transition-transform">
          <Users className="h-10 w-10 text-blue-500 mb-2" />
          <p className="text-gray-500">Total Employees</p>
          <h2 className="text-4xl font-extrabold text-indigo-700">{totalUsers}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-7 flex flex-col items-center hover:scale-105 transition-transform">
          <UserCheck className="h-10 w-10 text-green-500 mb-2" />
          <p className="text-gray-500">Present Today</p>
          <h2 className="text-4xl font-extrabold text-green-600">{presentToday}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-7 flex flex-col items-center hover:scale-105 transition-transform">
          <Clock className="h-10 w-10 text-yellow-500 mb-2" />
          <p className="text-gray-500">Late Today</p>
          <h2 className="text-4xl font-extrabold text-yellow-600">{lateToday}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-7 flex flex-col items-center hover:scale-105 transition-transform">
          <UserX className="h-10 w-10 text-red-500 mb-2" />
          <p className="text-gray-500">Absent Today</p>
          <h2 className="text-4xl font-extrabold text-red-600">{totalUsers - presentToday - lateToday}</h2>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-indigo-700">Employee Status</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-600 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-600 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-600 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-600 uppercase tracking-wider">Clock In</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-600 uppercase tracking-wider">Clock Out</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {mockUsers.map((user) => {
                const attendance = attendanceArr.find(
                  (a: any) => a.userId === user.id && a.date === today
                );
                return (
                  <tr key={user.id} className="hover:bg-indigo-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img className="h-10 w-10 rounded-full shadow" src={user.avatar} alt="" />
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${attendance?.status === 'present' ? 'bg-green-100 text-green-800' : 
                          attendance?.status === 'late' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {attendance?.status || 'absent'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {attendance?.clockIn || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {attendance?.clockOut || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};    

export default AdminDashboard;
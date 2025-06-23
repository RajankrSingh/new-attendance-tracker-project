import React, { useEffect, useState } from 'react';
import { User } from '../../types/types';
import { mockUsers } from '../../data/mockData';
import { LogOut, Eye, ChevronLeft, ChevronRight, Search } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedYear, setSelectedYear] = useState(currentTime.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentTime.getMonth());


  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

    // Filter users by search term (case-insensitive, matches name or email)
  const filteredUsers = mockUsers.filter(
    user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const attendanceArr = JSON.parse(localStorage.getItem('mockAttendance') || '[]');
  const today = new Date().toISOString().split('T')[0];

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };

  // --- Card Section for Employees ---
  const [activeCard, setActiveCard] = useState(0);

    const cardVisibleCount = 6; // Number of cards visible at once
  const [cardStart, setCardStart] = useState(0);
  const cardEnd = cardStart + cardVisibleCount;
  const canSlideLeft = cardStart > 0;
  const canSlideRight = cardEnd < filteredUsers.length;

  const handleSlideLeft = () => {
    if (canSlideLeft) setCardStart(cardStart - 1);
  };
  const handleSlideRight = () => {
    if (canSlideRight) setCardStart(cardStart + 1);
  };

  // --- Pagination for Table ---
  const [page, setPage] = useState(1);
  const rowsPerPage = 6;
  const paginatedUsers = filteredUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

    // Generate year options from attendance data or current year
const attendanceYears: number[] = Array.from(
  new Set(
    attendanceArr.map((a: any) => new Date(a.date).getFullYear())
  )
);
if (!attendanceYears.includes(currentTime.getFullYear())) {
  attendanceYears.push(currentTime.getFullYear());
}
attendanceYears.sort((a, b) => b - a);

  // Month options
  const monthNames = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString('default', { month: 'long' })
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-indigo-700 tracking-tight drop-shadow">
          Attendance <span className="font-normal">Month- {currentTime.toLocaleString('default', { month: 'long' })}</span>
        </h1>
         {/* Search Bar */}
      <div className="flex items-center mb-4">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            className="pl-10 pr-4 py-2 border rounded-full w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Search employee by name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>
      </div>
      
        <div className="flex items-center gap-6">
          
          {/* Real-time Date & Clock */}
          <div className="flex flex-col items-end bg-white rounded-xl shadow px-4 py-2 mr-2">
            <span className="text-base font-semibold text-indigo-700">
              {currentTime.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="text-xl font-mono text-gray-700 tracking-widest">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-2 px-5 rounded-full shadow-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
</div>

     

      {/* Card Section */}
<div className="flex items-center mb-6">
        <button
          className={`p-2 rounded-full border ${canSlideLeft ? 'border-blue-400 text-blue-600 hover:bg-blue-100' : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}
          onClick={handleSlideLeft}
          disabled={!canSlideLeft}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-4 mx-4">
          {mockUsers.slice(cardStart, cardEnd).map((user, idx) => (
            <div
              key={user.id}
              className={`flex flex-col items-center bg-white rounded-2xl shadow-lg px-6 py-5 min-w-[200px] transition-all cursor-pointer border-2 ${
                activeCard === cardStart + idx
                  ? 'border-blue-500 bg-blue-50 scale-105'
                  : 'border-transparent'
              }`}
              onClick={() => {
                setActiveCard(cardStart + idx);
                setSelectedUser(null);
              }}
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="h-16 w-16 rounded-full mb-2 object-cover border-2 border-indigo-200"
              />
              <div className="font-bold text-indigo-700">{user.name}</div>
              <div className="text-xs text-gray-500">{user.position}</div>
              <button
                className={`mt-3 px-4 py-1 rounded-full border-2 font-semibold text-sm ${
                  activeCard === cardStart + idx
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-blue-500 text-blue-500 hover:bg-blue-50'
                }`}
                onClick={e => {
                  e.stopPropagation();
                  setSelectedUser(user);
                }}
              >
                Profile Details
              </button>
            </div>
          ))}
        </div>
        <button
          className={`p-2 rounded-full border ${canSlideRight ? 'border-blue-400 text-blue-600 hover:bg-blue-100' : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}
          onClick={handleSlideRight}
          disabled={!canSlideRight}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Filter Section */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Year</span>
<select
  className="border rounded px-2 py-1"
  value={selectedYear}
  onChange={e => setSelectedYear(Number(e.target.value))} // <-- Number cast
>
  {attendanceYears.map((year) => (
    <option key={year} value={year}>{year}</option>
  ))}
</select>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Month</span>
<select
  className="border rounded px-2 py-1"
  value={selectedMonth}
  onChange={e => setSelectedMonth(Number(e.target.value))} // <-- Number cast
>
  {monthNames.map((name, idx) => (
    <option key={name} value={idx}>{name}</option>
  ))}
</select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <table className="min-w-full">
          <thead>
            <tr className="text-blue-700 text-sm">
              <th className="py-3 px-4 text-left">Employee</th>
              <th className="py-3 px-4 text-left">Designation</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Check-in Time</th>
              <th className="py-3 px-4 text-left">Checkout Time</th>
              <th className="py-3 px-4 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => {
              // Find today's attendance for the user
              const attendance = attendanceArr.find(
                (a: any) => a.userId === user.id && a.date === today
              );
              return (
                <tr key={user.id} className="hover:bg-blue-50 transition">
                  <td className="py-3 px-4 flex items-center gap-2">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <span>{user.name}</span>
                  </td>
                  <td className="py-3 px-4">{user.position}</td>
                  <td className="py-3 px-4">{today}</td>
                  <td className="py-3 px-4">{attendance?.clockIn || '-'}</td>
                  <td className="py-3 px-4">{attendance?.clockOut || '-'}</td>
                  <td className="py-3 px-4">
                    <button
                      className="border border-blue-400 text-blue-500 px-4 py-1 rounded-full hover:bg-blue-50 flex items-center gap-1"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              className="border rounded px-2 py-1"
              value={rowsPerPage}
              disabled
            >
              <option>{rowsPerPage}</option>
            </select>
          </div>
          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                className={`w-8 h-8 rounded border ${
                  page === idx + 1
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-blue-300 text-blue-500 hover:bg-blue-50'
                }`}
                onClick={() => setPage(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => setSelectedUser(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="flex items-center mb-6">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="h-20 w-20 rounded-full mr-6 border-4 border-indigo-200 shadow"
              />
              <div>
                <div className="text-2xl font-bold text-indigo-800">{selectedUser.name}</div>
                <div className="text-gray-500">{selectedUser.email}</div>
                <div className="text-gray-500">{selectedUser.position}</div>
                <div className="text-gray-500">{selectedUser.department}</div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-indigo-700">Today's Attendance</h3>
              {(() => {
                const attendance = attendanceArr.find(
                  (a: any) => a.userId === selectedUser.id && a.date === today
                );
                return (
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
                );
              })()}
            </div>
            {/* Monthly Attendance Summary */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2 text-indigo-700">This Month's Summary</h3>
              {(() => {
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth();
                const userMonthAttendance = attendanceArr.filter(
                  (a: any) => {
                    const d = new Date(a.date);
                    return (
                      a.userId === selectedUser.id &&
                      d.getFullYear() === year &&
                      d.getMonth() === month
                    );
                  }
                );
                const presentDays = userMonthAttendance.filter((a: any) => a.status === 'present').length;
                const lateDays = userMonthAttendance.filter((a: any) => a.status === 'late').length;
                const allDatesInMonth = attendanceArr
                  .filter((a: any) => {
                    const d = new Date(a.date);
                    return d.getFullYear() === year && d.getMonth() === month;
                  })
                  .map((a: any) => a.date);
                const uniqueDates = Array.from(new Set(allDatesInMonth));
                const totalWorkingDays = uniqueDates.length;
                const absentDays = totalWorkingDays - (presentDays + lateDays);

                // Salary Calculation
                const monthlySalary =
                  typeof (selectedUser as any).salary === 'number'
                    ? (selectedUser as any).salary
                    : 30000;
                const perDaySalary = monthlySalary / totalWorkingDays || 0;
                // Priya credited 5 days salary
                const isPriya = selectedUser.email === 'priya@company.com';
                const creditedDays = isPriya ? 5 : presentDays + lateDays;
                const creditedSalary = Math.round(perDaySalary * creditedDays);

                return (
                  <div className="flex flex-col gap-2">
                    <div>
                      <span className="font-medium text-green-700">Present Days: </span>
                      <span className="font-bold">{presentDays}</span>
                    </div>
                    <div>
                      <span className="font-medium text-yellow-700">Late Days: </span>
                      <span className="font-bold">{lateDays}</span>
                    </div>
                    <div>
                      <span className="font-medium text-red-700">Absent Days: </span>
                      <span className="font-bold">{absentDays < 0 ? 0 : absentDays}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total Working Days: </span>
                      <span className="font-bold">{totalWorkingDays}</span>
                    </div>
                    <div className="mt-2 border-t pt-2">
                      <span className="font-medium text-indigo-700">Monthly Salary: </span>
                      <span className="font-bold">₹{monthlySalary.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-indigo-700">Earned Salary: </span>
                      <span className="font-bold">
                        ₹{creditedSalary.toLocaleString()}
                        {isPriya && (
                          <span className="ml-2 text-xs text-gray-500">(5 days credited)</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Eye, ChevronLeft, ChevronRight, Search, Users, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

interface ProfileWithAttendance {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  department: string;
  position: string;
  avatar: string | null;
  todayAttendance?: {
    clock_in: string | null;
    clock_out: string | null;
    status: string;
  };
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [users, setUsers] = useState<ProfileWithAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<ProfileWithAttendance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCard, setActiveCard] = useState(0);
  const [cardStart, setCardStart] = useState(0);
  const [page, setPage] = useState(1);

  const cardVisibleCount = 6;
  const rowsPerPage = 6;

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      navigate('/');
    }
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchUsersWithAttendance();
    }
  }, [user, profile]);

  const fetchUsersWithAttendance = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Fetch all users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Fetch today's attendance for all users
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('date', today);

      if (attendanceError) {
        console.error('Error fetching attendance:', attendanceError);
      }

      // Combine profiles with their attendance data
      const usersWithAttendance = profiles.map(profile => {
        const todayAttendance = attendanceData?.find(att => att.user_id === profile.id);
        return {
          ...profile,
          todayAttendance: todayAttendance ? {
            clock_in: todayAttendance.clock_in,
            clock_out: todayAttendance.clock_out,
            status: todayAttendance.status,
          } : undefined,
        };
      });

      setUsers(usersWithAttendance);
    } catch (error) {
      console.error('Error fetching users with attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Filter users by search term
  const filteredUsers = users.filter(
    user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Card navigation
  const cardEnd = cardStart + cardVisibleCount;
  const canSlideLeft = cardStart > 0;
  const canSlideRight = cardEnd < filteredUsers.length;

  const handleSlideLeft = () => {
    if (canSlideLeft) setCardStart(cardStart - 1);
  };

  const handleSlideRight = () => {
    if (canSlideRight) setCardStart(cardStart + 1);
  };

  // Pagination
  const paginatedUsers = filteredUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  // Stats
  const totalUsers = users.length;
  const presentToday = users.filter(u => u.todayAttendance?.status === 'present').length;
  const lateToday = users.filter(u => u.todayAttendance?.status === 'late').length;
  const absentToday = totalUsers - presentToday - lateToday;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-extrabold text-indigo-700 tracking-tight drop-shadow">
            Admin Dashboard
          </h1>
          
          {/* Stats Cards */}
          <div className="flex gap-4 ml-8">
            <div className="bg-white rounded-lg shadow px-4 py-2 border border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm text-gray-600">Total Users</div>
                  <div className="font-bold text-blue-600">{totalUsers}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow px-4 py-2 border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <div className="text-sm text-gray-600">Present</div>
                  <div className="font-bold text-green-600">{presentToday}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow px-4 py-2 border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div>
                  <div className="text-sm text-gray-600">Late</div>
                  <div className="font-bold text-yellow-600">{lateToday}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow px-4 py-2 border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div>
                  <div className="text-sm text-gray-600">Absent</div>
                  <div className="font-bold text-red-600">{absentToday}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              className="pl-10 pr-4 py-2 border rounded-full w-64 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
          
          {/* Real-time Date & Clock */}
          <div className="flex flex-col items-end bg-white rounded-xl shadow px-4 py-2">
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Card Section */}
          <div className="flex items-center mb-6">
            <button
              className={`p-2 rounded-full border ${canSlideLeft ? 'border-blue-400 text-blue-600 hover:bg-blue-100' : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}
              onClick={handleSlideLeft}
              disabled={!canSlideLeft}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="flex gap-4 mx-4 overflow-hidden">
              {filteredUsers.slice(cardStart, cardEnd).map((user, idx) => (
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
                  <div className="h-16 w-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mb-2">
                    <span className="text-white font-bold text-lg">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div className="font-bold text-indigo-700 text-center">{user.name}</div>
                  <div className="text-xs text-gray-500 text-center">{user.position}</div>
                  <div className="mt-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.todayAttendance?.status === 'present'
                          ? 'bg-green-100 text-green-800'
                          : user.todayAttendance?.status === 'late'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.todayAttendance?.status || 'absent'}
                    </span>
                  </div>
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
                    View Details
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

          {/* Table Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-6 h-6 text-indigo-500" />
              <h2 className="text-xl font-bold text-gray-900">Today's Attendance</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-blue-700 text-sm border-b border-gray-200">
                    <th className="py-3 px-4 text-left">Employee</th>
                    <th className="py-3 px-4 text-left">Department</th>
                    <th className="py-3 px-4 text-left">Position</th>
                    <th className="py-3 px-4 text-left">Clock In</th>
                    <th className="py-3 px-4 text-left">Clock Out</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50 transition border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{user.department}</td>
                      <td className="py-3 px-4 text-gray-700">{user.position}</td>
                      <td className="py-3 px-4 font-mono text-sm">
                        {user.todayAttendance?.clock_in ? 
                          new Date(`2000-01-01T${user.todayAttendance.clock_in}`).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          }) : '-'
                        }
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">
                        {user.todayAttendance?.clock_out ? 
                          new Date(`2000-01-01T${user.todayAttendance.clock_out}`).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          }) : '-'
                        }
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.todayAttendance?.status === 'present'
                              ? 'bg-green-100 text-green-800'
                              : user.todayAttendance?.status === 'late'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.todayAttendance?.status || 'absent'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          className="flex items-center gap-1 border border-blue-400 text-blue-500 px-3 py-1 rounded-full hover:bg-blue-50 text-sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Showing {((page - 1) * rowsPerPage) + 1} to {Math.min(page * rowsPerPage, filteredUsers.length)} of {filteredUsers.length} employees
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
        </>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => setSelectedUser(null)}
              aria-label="Close"
            >
              &times;
            </button>
            
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">
                  {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-indigo-800">{selectedUser.name}</h2>
              <p className="text-gray-600">{selectedUser.email}</p>
              <p className="text-gray-600">{selectedUser.position}</p>
              <p className="text-gray-600">{selectedUser.department}</p>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedUser.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {selectedUser.role}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-indigo-700">Today's Attendance</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedUser.todayAttendance?.status === 'present'
                          ? 'bg-green-100 text-green-800'
                          : selectedUser.todayAttendance?.status === 'late'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedUser.todayAttendance?.status || 'absent'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Clock In:</span>
                    <span className="text-sm font-mono">
                      {selectedUser.todayAttendance?.clock_in ? 
                        new Date(`2000-01-01T${selectedUser.todayAttendance.clock_in}`).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        }) : '-'
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Clock Out:</span>
                    <span className="text-sm font-mono">
                      {selectedUser.todayAttendance?.clock_out ? 
                        new Date(`2000-01-01T${selectedUser.todayAttendance.clock_out}`).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        }) : '-'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
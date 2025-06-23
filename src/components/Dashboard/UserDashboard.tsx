import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Clock, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAttendance } from '../../hooks/useAttendance';
import ClockInOut from '../Attendance/ClockInOutButton';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { attendanceRecords, loading: attendanceLoading } = useAttendance(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Calculate monthly stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyRecords = attendanceRecords.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
  });

  const presentDays = monthlyRecords.filter(record => record.status === 'present').length;
  const lateDays = monthlyRecords.filter(record => record.status === 'late').length;
  const totalWorkingDays = monthlyRecords.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-100 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-indigo-700 tracking-tight">
          <span className="bg-gradient-to-r from-indigo-500 to-blue-400 bg-clip-text text-transparent">
            Welcome, {profile.name}!
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

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-gray-600">{profile.position}</p>
              <p className="text-sm text-gray-500">{profile.department}</p>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>

            {/* Monthly Stats */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-center">This Month</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{presentDays}</div>
                  <div className="text-xs text-green-700">Present</div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{lateDays}</div>
                  <div className="text-xs text-yellow-700">Late</div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{totalWorkingDays}</div>
                <div className="text-xs text-blue-700">Total Days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Clock In/Out Section */}
        <div className="lg:col-span-2">
          <ClockInOut />
          
          {/* Recent Attendance */}
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-6 h-6 text-indigo-500" />
              <h3 className="text-xl font-bold text-gray-900">Recent Attendance</h3>
            </div>

            {attendanceLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : attendanceRecords.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {attendanceRecords.slice(0, 10).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(record.date).getFullYear()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {record.clock_in ? 
                            new Date(`2000-01-01T${record.clock_in}`).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            }) : '-'
                          }
                          {record.clock_out && (
                            <> - {new Date(`2000-01-01T${record.clock_out}`).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}</>
                          )}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        record.status === 'present'
                          ? 'bg-green-100 text-green-800'
                          : record.status === 'late'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No attendance records found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
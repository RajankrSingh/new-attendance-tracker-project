import { User, AttendanceRecord, LeaveRequest, LeaveBalance } from '../types/types';
import { addDays, format, subDays } from 'date-fns';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'rajan@company.com',
    name: 'Rajan Kumar',
    role: 'admin',
    department: 'Management',
    position: 'Admin Manager',
    avatar: 'https://randomuser.me/api/portraits/men/65.jpg', // Indian male
  },
  {
    id: '2',
    email: 'neha@company.com',
    name: 'Neha Singh',
    role: 'user',
    department: 'Engineering',
    position: 'Senior Developer',
    avatar: 'https://randomuser.me/api/portraits/women/66.jpg', // Indian female
  },
  {
    id: '3',
    email: 'prithvi@company.com',
    name: 'Prithvi Sen',
    role: 'user',
    department: 'Engineering',
    position: 'Senior Developer',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg', // Indian male
  },
  {
    id: '4',
    email: 'kajal@company.com',
    name: 'Kajal Kakke',
    role: 'user',
    department: 'Engineering',
    position: 'Senior Developer',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg', // Indian female
  },
  {
    id: '5',
    email: 'deepak@company.com',
    name: 'Deepak Kumar',
    role: 'user',
    department: 'Engineering',
    position: 'Senior Developer',
    avatar: 'https://randomuser.me/api/portraits/men/69.jpg', // Indian male
  },
  {
    id: '6',
    email: 'manik@company.com',
    name: 'Manik',
    role: 'user',
    department: 'Engineering',
    position: 'Senior Developer',
    avatar: 'https://randomuser.me/api/portraits/women/70.jpg', // Indian female
  },
  {
    id: '7',
    email: 'tannu@company.com',
    name: 'Tannu',
    role: 'user',
    department: 'Engineering',
    position: 'Senior Developer',
    avatar: 'https://randomuser.me/api/portraits/men/71.jpg', // Indian male
  },
  {
    id: '8',
    email: 'ritik@company.com',
    name: 'Ritik Kumar',
    role: 'user',
    department: 'Engineering',
    position: 'Senior Developer',
    avatar: 'https://randomuser.me/api/portraits/women/72.jpg', // Indian female
  },
  {
    id: '9',
    email: 'shivam@company.com',
    name: 'Shivam Kumar',
    role: 'user',
    department: 'Engineering',
    position: 'Senior Developer',
    avatar: 'https://randomuser.me/api/portraits/men/73.jpg', // Indian male
  },
  {
    id: '10',
    email: 'anand@company.com',
    name: 'Anand Thakur',
    role: 'user',
    department: 'Engineering',
    position: 'Senior Developer',
    avatar: 'https://randomuser.me/api/portraits/women/74.jpg', // Indian female
  },
  // Add more mock users as needed
];

const today = new Date();

export const mockAttendance: AttendanceRecord[] = [
  {
    id: '1',
    userId: '2',
    date: format(today, 'yyyy-MM-dd'),
    clockIn: '09:00',
    clockOut: '17:30',
    status: 'present',
  },
  {
    id: '2',
    userId: '2',
    date: format(subDays(today, 1), 'yyyy-MM-dd'),
    clockIn: '09:15',
    clockOut: '17:45',
    status: 'late',
  },
  {
    id: '3',
    userId: '2',
    date: format(today, 'yyyy-MM-dd'),
    clockIn: '09:00',
    clockOut: '17:30',
    status: 'present',
  },
  {
    id: '4',
    userId: '4',
    date: format(subDays(today, 1), 'yyyy-MM-dd'),
    clockIn: '09:15',
    clockOut: '17:45',
    status: 'present',
  },
  // Add more attendance records
];

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    userId: '2',
    startDate: format(addDays(today, 5), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 7), 'yyyy-MM-dd'),
    type: 'vacation',
    status: 'pending',
    reason: 'Family vacation',
  },
  {
    id: '2',
    userId: '3',
    startDate: format(addDays(today, 5), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 7), 'yyyy-MM-dd'),
    type: 'vacation',
    status: 'pending',
    reason: 'Family vacation',
  },
  // Add more leave requests
];

export const mockLeaveBalance: LeaveBalance[] = [
  {
    userId: '2',
    sick: 10,
    vacation: 15,
    personal: 5,
  },
  // Add more leave balances
];
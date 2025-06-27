import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Smartphone, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

type AuthMode = 'email' | 'phone' | 'signup';

const Login: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [position, setPosition] = useState('Employee');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, signInWithOTP, verifyOTP, signUp, user, profile } = useAuth();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      if (authMode === 'signup') {
        const { data, error } = await signUp(email, password, {
          name,
          role,
          department,
          position,
        });

        if (error) {
          console.error('Signup error:', error);
          if (error.message.includes('User already registered')) {
            setError('An account with this email already exists. Please sign in instead.');
          } else if (error.message.includes('Password should be at least 6 characters')) {
            setError('Password must be at least 6 characters long.');
          } else if (error.message.includes('Invalid email')) {
            setError('Please enter a valid email address.');
          } else {
            setError(error.message);
          }
        } else {
          console.log('Signup successful:', data);
          setSuccess('Account created successfully! You can now sign in with your credentials.');
          setAuthMode('email');
          setEmail('');
          setPassword('');
          setName('');
        }
      } else {
        const { data, error } = await signIn(email, password);

        if (error) {
          console.error('Signin error:', error);
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please check your credentials.');
          } else if (error.message.includes('Email not confirmed')) {
            setError('Please check your email and click the verification link before signing in.');
          } else if (error.message.includes('Too many requests')) {
            setError('Too many login attempts. Please wait a few minutes before trying again.');
          } else {
            setError(error.message);
          }
        } else {
          console.log('Signin successful:', data);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!otpSent) {
      // Send OTP
      try {
        const { error } = await signInWithOTP(phone);
        if (error) {
          console.error('OTP send error:', error);
          if (error.message.includes('SMS provider not configured')) {
            setError('SMS service is not configured. Please contact the administrator or use email login.');
          } else if (error.message.includes('Invalid phone number')) {
            setError('Please enter a valid phone number with country code (e.g., +1234567890).');
          } else {
            setError('Failed to send OTP. Please try again or use email login.');
          }
        } else {
          setOtpSent(true);
          setSuccess('OTP sent to your phone number. Please enter the code below.');
        }
      } catch (err) {
        console.error('OTP send error:', err);
        setError('Failed to send OTP. Please try again or use email login.');
      }
    } else {
      // Verify OTP
      try {
        const { error } = await verifyOTP(phone, otp);
        if (error) {
          console.error('OTP verify error:', error);
          if (error.message.includes('Invalid token')) {
            setError('Invalid OTP code. Please check and try again.');
          } else if (error.message.includes('Token has expired')) {
            setError('OTP code has expired. Please request a new one.');
          } else {
            setError('Failed to verify OTP. Please try again.');
          }
        } else {
          console.log('OTP verification successful');
        }
      } catch (err) {
        console.error('OTP verify error:', err);
        setError('Failed to verify OTP. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('Google sign in error:', error);
        if (error.message.includes('provider is not enabled')) {
          setError('Google login is not enabled. Please contact the administrator or use email/password login.');
        } else {
          setError('Failed to sign in with Google. Please try again or use email/password login.');
        }
      }
    } catch (err) {
      console.error('Google sign in error:', err);
      setError('Failed to sign in with Google. Please try again or use email/password login.');
    } finally {
      setLoading(false);
    }
  };

  const resetPhoneAuth = () => {
    setOtpSent(false);
    setOtp('');
    setPhone('');
    setError('');
    setSuccess('');
  };

  // Navigate based on user role when authenticated
  React.useEffect(() => {
    if (user && profile) {
      console.log('Navigating user:', user.email, 'with role:', profile.role);
      navigate(profile.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [navigate, user, profile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <div className="flex justify-center">
            {authMode === 'phone' ? (
              <Smartphone className="h-12 w-12 text-indigo-500" />
            ) : authMode === 'signup' ? (
              <UserPlus className="h-12 w-12 text-indigo-500" />
            ) : (
              <LogIn className="h-12 w-12 text-indigo-500" />
            )}
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {authMode === 'phone' 
              ? (otpSent ? 'Enter OTP Code' : 'Sign in with Phone')
              : authMode === 'signup' 
              ? 'Create your account' 
              : 'Sign in to your account'
            }
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {authMode === 'phone' 
              ? (otpSent ? 'Enter the 6-digit code sent to your phone' : 'Enter your phone number to receive an OTP')
              : authMode === 'signup' 
              ? 'Join the attendance tracking system'
              : 'Choose your preferred sign-in method'
            }
          </p>
        </div>

        {/* Auth Mode Selector */}
        {!otpSent && (
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode('email');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                authMode === 'email' || authMode === 'signup'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('phone');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                authMode === 'phone'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Phone
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg relative" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        {/* Google Sign In Button - Only show for email mode */}
        {authMode === 'email' && (
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
            
            <div className="mt-4 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>
          </div>
        )}

        {/* Email Form */}
        {(authMode === 'email' || authMode === 'signup') && (
          <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
            <div className="space-y-4">
              {authMode === 'signup' && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <select
                        id="department"
                        name="department"
                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Management">Management</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                        <option value="Marketing">Marketing</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                        Position
                      </label>
                      <input
                        id="position"
                        name="position"
                        type="text"
                        required
                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Your position"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </>
              )}
              
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={authMode === 'signup' ? "new-password" : "current-password"}
                  required
                  minLength={6}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password (minimum 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {authMode === 'signup' ? (
                      <>
                        <UserPlus className="w-5 h-5 mr-2" />
                        Create Account
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5 mr-2" />
                        Sign In
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'signup' ? 'email' : 'signup');
                  setError('');
                  setSuccess('');
                }}
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                {authMode === 'signup' 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </form>
        )}

        {/* Phone Form */}
        {authMode === 'phone' && (
          <form className="mt-8 space-y-6" onSubmit={handlePhoneSubmit}>
            <div className="space-y-4">
              {!otpSent ? (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="+1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Include country code (e.g., +1 for US, +91 for India)
                  </p>
                </div>
              ) : (
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                    OTP Code
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength={6}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                  <p className="mt-1 text-xs text-gray-500 text-center">
                    Sent to {phone}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Smartphone className="w-5 h-5 mr-2" />
                    {otpSent ? 'Verify OTP' : 'Send OTP'}
                  </>
                )}
              </button>

              {otpSent && (
                <button
                  type="button"
                  onClick={resetPhoneAuth}
                  className="w-full text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Use different phone number
                </button>
              )}
            </div>
          </form>
        )}

        {/* Help text */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Setup Instructions:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• <strong>Google Login:</strong> Enable Google OAuth in Supabase Dashboard → Authentication → Providers</li>
            <li>• <strong>SMS OTP:</strong> Configure SMS provider in Supabase Dashboard → Authentication → Settings</li>
            <li>• <strong>Email Confirmation:</strong> Disable in Supabase Dashboard → Authentication → Settings for immediate login</li>
            <li>• Contact support if you need help with configuration</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
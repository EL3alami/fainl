import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, BookOpen, Shield } from 'lucide-react';

export default function Login() {
  const [step, setStep] = useState('role');
  const [selectedRole, setSelectedRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add real login logic here
    if (!selectedRole) return;
    if (selectedRole.id === 'student') {
      navigate('/student/dashboard');
    } else if (selectedRole.id === 'professor') {
      navigate('/professor/dashboard');
    } else if (selectedRole.id === 'admin') {
      navigate('/admin/dashboard');
    }
  };

  const roles = [
    {
      id: 'student',
      name: 'Student',
      icon: User,
      description: 'Access courses, grades, and class schedules',
      color: 'from-blue-400 to-cyan-400',
    },
    {
      id: 'professor',
      name: 'Professor',
      icon: BookOpen,
      description: 'Manage courses and supervise students',
      color: 'from-yellow-400 to-orange-400',
    },
    {
      id: 'admin',
      name: 'Admin',
      icon: Shield,
      description: 'Manage system and user accounts',
      color: 'from-purple-400 to-fuchsia-400',
    },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-300 via-purple-200 to-cyan-200 p-2">
      {step === 'role' ? (
        <div className="w-full flex flex-col items-center">
          <div className="flex flex-col items-center gap-8 mt-14 mb-2">
            <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role);
                    setStep('login');
                  }}
                  className={`flex-1 min-w-[220px] max-w-[280px] px-10 py-8 rounded-[2.2rem] bg-gradient-to-br ${role.color} text-white flex flex-col items-center shadow-[0_8px_32px_0_rgba(31,38,135,0.18)] hover:scale-105 hover:shadow-2xl transition-all border-2 border-transparent hover:border-white/70 focus:outline-none focus:ring-4 focus:ring-blue-200`}
                  style={{
                    backdropFilter: 'blur(2px)',
                    WebkitBackdropFilter: 'blur(2px)',
                  }}
                >
                  <span className="mb-3">
                    {role.icon && <role.icon size={38} className="drop-shadow-lg opacity-90" />}
                  </span>
                  <span className="font-extrabold text-2xl mb-1 tracking-wide drop-shadow-sm" style={{letterSpacing: '0.5px'}}>{role.name}</span>
                  <span className="text-base opacity-95 mt-1 text-center font-medium leading-snug drop-shadow-sm" style={{lineHeight: '1.35'}}>{role.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-lg bg-white/70 backdrop-blur-lg border border-white/40 rounded-3xl shadow-2xl mx-auto px-7 py-8 sm:px-14 sm:py-12 flex flex-col items-center relative" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
          {/* Change Role button top-right (moved for better layout) */}
          <div className="w-full flex justify-end mb-2 mt-4 pr-3">
            <button
              type="button"
              className="text-blue-600 hover:underline text-sm font-semibold px-2 py-1 rounded focus:outline-none"
              onClick={() => setStep('role')}
              aria-label="Change role"
              style={{minWidth: 0, letterSpacing: '0.2px'}}>
              Change Role →
            </button>
          </div>
          <div className="w-full px-2 sm:px-4">
            <div className="flex flex-col items-center w-full">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center mb-5 mt-2 shadow-lg border-4 border-white/60">
                <User size={64} className="text-white drop-shadow-lg" />
              </div>
              <h2 className="text-4xl font-extrabold text-blue-700 mb-2 mt-2 tracking-tight" style={{ fontFamily: 'cursive' }}>Welcome 👋</h2>
              <p className="text-orange-500 text-base mb-7 font-medium">Sign in to your university account</p>
            </div>
            {/* Centered role badge */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur rounded-full border border-white/30 shadow-sm">
                {selectedRole?.icon && (
                  <selectedRole.icon size={18} className="text-blue-600" />
                )}
                <span className="font-semibold text-gray-800">{selectedRole?.name}</span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5 items-center">
              <div>
                <label htmlFor="email" className="block text-base font-semibold text-gray-700 mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-72 max-w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/80 mx-auto"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-base font-semibold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-72 max-w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-300 pr-12 bg-white/80 mx-auto"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-blue-500" />
                  Remember me
                </label>
                <a href="#" className="text-sm text-blue-500 hover:underline font-semibold">Forgot password?</a>
              </div>
              <button
                type="submit"
                className="w-72 max-w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-extrabold rounded-xl shadow-lg transition-all text-lg mt-2 tracking-wide mx-auto"
              >
                Sign In
              </button>
            </form>
            <div className="w-full text-center mt-7">
              <span className="text-base text-gray-600">Need help? <a href="#" className="text-blue-500 font-bold hover:underline">Support</a></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

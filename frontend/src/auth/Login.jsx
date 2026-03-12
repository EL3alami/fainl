import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, GraduationCap, AlertCircle } from 'lucide-react';
import { authApi } from '../services/api';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // إرسال البيانات للـ Backend API
      const data = await authApi.login(username.trim(), password);

      if (data.success) {
        // حفظ بيانات المستخدم والـ Token في localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('role', data.user.role);

        // التوجيه بناءً على الـ role مع إرسال حالة "تم الدخول من اللوجين"
        navigate(data.redirect_path, { state: { fromLogin: true } });
      }
    } catch (err) {
      setError(err.message || 'اسم المستخدم أو كلمة المرور غير صحيحة.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Animated background blobs */}
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />
      <div className="login-blob login-blob-3" />

      <div className="login-card">
        {/* Left panel */}
        <div className="login-panel-left">
          <div className="login-panel-left-inner">
            <div className="login-logo-wrap">
              <span style={{ fontSize: '32px', fontWeight: '1000', color: 'white' }}>EP</span>
            </div>
            <h1 className="login-university-name">Edu_Point</h1>
            <p className="login-university-sub">Unified Academic Operating System</p>
            <p className="login-university-sub">Smart Learning Environment</p>

            <ul className="login-feature-list">
              <li><span className="login-feature-dot" />Student Portal Access</li>
              <li><span className="login-feature-dot" />Professor Management</li>
              <li><span className="login-feature-dot" />Academic Records</li>
              <li><span className="login-feature-dot" />Course Registration</li>
            </ul>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="login-panel-right">
          <div className="login-form-wrap">
            <div className="login-form-header">
              <h2 className="login-title">Welcome Back</h2>
              <p className="login-subtitle">Sign in to your university account</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
              {/* Username */}
              <div className="login-field">
                <label htmlFor="username" className="login-label">Username</label>
                <div className="login-input-wrap">
                  <User size={17} className="login-input-icon" />
                  <input
                    id="username"
                    type="text"
                    className="login-input"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-field">
                <label htmlFor="password" className="login-label">Password</label>
                <div className="login-input-wrap">
                  <Lock size={17} className="login-input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="login-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    required
                  />
                  <button
                    type="button"
                    className="login-eye-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="login-error" role="alert">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Options row */}
              <div className="login-options-row">
                <label className="login-remember">
                  <input type="checkbox" className="login-checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="#" className="login-forgot">Forgot password?</a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`login-btn${loading ? ' login-btn--loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <span className="login-spinner" />
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="login-help">
              Need help?&nbsp;
              <a href="mailto:support@edupoint.io" className="login-help-link">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

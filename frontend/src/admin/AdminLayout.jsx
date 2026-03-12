import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { semestersApi, authApi } from "../services/api";
import {
  Calendar,
  RefreshCw,
  LogOut,
  Bell,
  User as UserIcon,
  Search,
  LayoutGrid
} from "lucide-react";
import "./admin.css";

const SemesterSelectionModal = ({ semesters, onSelect, onLogout }) => {
  return (
    <div className="modal" style={{ background: 'rgba(15, 23, 42, 0.95)', zIndex: 9999 }}>
      <div className="modal-content glass-effect animate-in" style={{ maxWidth: '450px', background: 'white', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        <div className="modal-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>📅</div>
          <h2 style={{ fontSize: '24px', fontWeight: '1000', color: '#1e293b' }}>Select Academic Session</h2>
          <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Please choose the academic year and term you wish to manage.</p>
        </div>

        <div className="semester-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
          {semesters.map(s => (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className="semester-item-btn"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 25px',
                borderRadius: '16px',
                border: '1.5px solid #f1f5f9',
                background: '#f8fafc',
                cursor: 'pointer',
                transition: '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div>
                <div style={{ fontWeight: '1000', fontSize: '16px', color: '#1e293b' }}>{s.year} Academic Year</div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '850', textTransform: 'capitalize' }}>{s.term} Term</div>
              </div>
              {s.is_active && (
                <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#059669', padding: '6px 12px', borderRadius: '20px', fontWeight: '1000' }}>
                  ACTIVE NOW
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button onClick={onLogout} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '900', cursor: 'pointer', textDecoration: 'underline' }}>
            Proceed to Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminLayout() {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      const data = await semestersApi.getAll();
      setSemesters(data);

      const savedSem = localStorage.getItem('admin_working_semester');
      if (savedSem) {
        setSelectedSemester(JSON.parse(savedSem));
      } else {
        setShowModal(true);
      }
    } catch (err) {
      console.error("Failed to load semesters", err);
    }
  };

  const handleSelect = (semester) => {
    localStorage.setItem('admin_working_semester', JSON.stringify(semester));
    localStorage.setItem('admin_working_semester_id', semester.id);
    setSelectedSemester(semester);
    setShowModal(false);
    window.location.reload();
  };

  const handleLogout = async () => {
    try { await authApi.logout(); } catch (err) { }
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="admin-container">
      {showModal && <SemesterSelectionModal semesters={semesters} onSelect={handleSelect} onLogout={handleLogout} />}

      <Sidebar
        currentSemester={selectedSemester}
        onChangeSemester={() => setShowModal(true)}
        onLogout={handleLogout}
      />

      <div className="admin-content">
        {/* IMPROVED TOP BAR V3 */}
        <header className="top-bar-v3">
          <div className="top-bar-left-extra" style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button className="nav-icon-btn-v3"><LayoutGrid size={18} /></button>
            <div className="nav-search-bar-v3" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '10px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', width: '300px' }}>
              <Search size={16} className="text-slate-400" />
              <input type="text" placeholder="Omni Search (Ctrl+K)" style={{ background: 'none', border: 'none', outline: 'none', fontSize: '13px', fontWeight: '600', width: '100%' }} />
            </div>
          </div>

          <div className="top-bar-actions-v3" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button className="nav-icon-btn-v3" style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', color: '#64748b', cursor: 'pointer' }}><Bell size={18} /></button>

            <div className="user-profile-v3">
              <div className="user-info-v3">
                <span className="user-name-v3">{user?.name_en || 'Admin Portal'}</span>
                <span className="user-role-v3">Master Administrator</span>
              </div>
              <div className="user-img-v3">
                {user?.name_en?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        <div className="admin-page-canvas">
          <Outlet context={{ selectedSemester }} />
        </div>
      </div >
    </div >
  );
}

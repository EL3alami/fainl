import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { coursesApi, departmentsApi, professorsApi, semestersApi } from "../../services/api";
import "./AdminPages.css";

const CourseFormModal = ({ editing, formData, setFormData, handleSubmit, setShowForm, departments }) => {
  const courseTypes = [
    { value: 'general_mandatory', label: 'General Mandatory' },
    { value: 'general_elective', label: 'General Elective' },
    { value: 'college_mandatory', label: 'College Mandatory' },
    { value: 'college_elective', label: 'College Elective' },
    { value: 'dept_mandatory', label: 'Department Mandatory' },
    { value: 'dept_elective', label: 'Department Elective' },
    { value: 'project', label: 'Project' },
    { value: 'training', label: 'Training' },
    { value: 'remedial', label: 'Remedial' },
  ];

  return (
    <div className="modal">
      <div className="modal-content glass-effect animate-in" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h3>{editing ? "Edit Course" : "Add New Course"}</h3>
          <p className="subtitle">Configure course details, credits, and academic levels.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(79, 70, 229, 0.05)', padding: '12px', borderRadius: '12px' }}>
              <input
                type="checkbox"
                id="is_available"
                style={{ width: '20px', height: '20px' }}
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              />
              <label htmlFor="is_available" style={{ margin: 0, fontWeight: 700, color: '#4f46e5' }}>
                Available for Registration this semester?
              </label>
            </div>
            <div className="form-group">
              <label>Course Name (English)</label>
              <input
                placeholder="e.g. Operating Systems"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Course Name (Arabic)</label>
              <input
                placeholder="مثال: نظم التشغيل"
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Course Code (English)</label>
              <input
                placeholder="e.g. CS241"
                value={formData.code_en}
                onChange={(e) => setFormData({ ...formData, code_en: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div className="form-group">
              <label>Course Code (Arabic)</label>
              <input
                placeholder="مثال: حسب241"
                value={formData.code_ar}
                onChange={(e) => setFormData({ ...formData, code_ar: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Credit Hours</label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.credit_hours}
                onChange={(e) => setFormData({ ...formData, credit_hours: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Level (1-4)</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                required
              >
                {[1, 2, 3, 4].map(l => <option key={l} value={l}>Level {l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Course Type</label>
              <select
                value={formData.course_type}
                onChange={(e) => setFormData({ ...formData, course_type: e.target.value })}
                required
              >
                {courseTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Department (Optional)</label>
              <select
                value={formData.department_id || ""}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value || null })}
              >
                <option value="">General (All Departments)</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name_en}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Lecture Hours</label>
              <input
                type="number"
                min="0"
                value={formData.lecture_hrs}
                onChange={(e) => setFormData({ ...formData, lecture_hrs: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Lab Hours</label>
              <input
                type="number"
                min="0"
                value={formData.lab_hrs}
                onChange={(e) => setFormData({ ...formData, lab_hrs: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-primary">
              {editing ? "Save Changes" : "Create Course"}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [professors, setProfessors] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [activeLevel, setActiveLevel] = useState(1);
  const [activeDept, setActiveDept] = useState("");

  const { selectedSemester } = useOutletContext();

  const [assignData, setAssignData] = useState({
    course_id: "",
    professor_id: "",
    semester_id: "",
  });

  const [formData, setFormData] = useState({
    code_ar: "",
    code_en: "",
    name_ar: "",
    name_en: "",
    credit_hours: 3,
    lecture_hrs: 2,
    lab_hrs: 2,
    level: 1,
    course_type: "college_mandatory",
    department_id: null,
    is_available: true,
  });

  useEffect(() => {
    fetchData();
  }, [selectedSemester, activeLevel, activeDept]); // fetchData will now use these values

  const fetchData = async () => {
    try {
      setLoading(true);
      let params = `level=${activeLevel}`;
      if (activeDept) params += `&department_id=${activeDept}`;

      const [coursesData, deptsData, profsData, semsData] = await Promise.all([
        coursesApi.getAll(params),
        departmentsApi.getAll(),
        professorsApi.getAll(),
        semestersApi.getAll()
      ]);
      setCourses(coursesData);
      setDepartments(deptsData);
      setProfessors(profsData);
      setSemesters(semsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditing(null);
    setFormData({
      code_ar: "", code_en: "", name_ar: "", name_en: "",
      credit_hours: 3, lecture_hrs: 2, lab_hrs: 2,
      level: 1, course_type: "college_mandatory", department_id: null,
      is_available: true
    });
    setShowForm(true);
  };

  const handleEdit = (course) => {
    setEditing(course);
    setFormData({
      code_ar: course.code_ar || "",
      code_en: course.code_en,
      name_ar: course.name_ar,
      name_en: course.name_en,
      credit_hours: course.credit_hours,
      lecture_hrs: course.lecture_hrs,
      lab_hrs: course.lab_hrs,
      level: course.level,
      course_type: course.course_type,
      department_id: course.department_id,
      is_available: course.is_available === 1 || course.is_available === true,
    });
    setShowForm(true);
  };

  const handleOpenAssign = (course) => {
    setAssignData({
      course_id: course.id,
      professor_id: "",
      semester_id: semesters.find(s => s.is_active)?.id || (semesters[0]?.id || ""),
    });
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await professorsApi.assignCourse(assignData);
      setShowAssignModal(false);
      alert("Professor assigned successfully!");
      fetchData(); // Refresh the courses list to fetch the updated assigned_professor
    } catch (err) {
      alert(err.message || "Assignment failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await coursesApi.update(editing.id, formData);
      } else {
        await coursesApi.create(formData);
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert(err.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course? This action cannot be undone if students are not enrolled.")) return;
    try {
      await coursesApi.delete(id);
      fetchData();
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  const filteredCourses = courses.filter(c =>
    c.name_en.toLowerCase().includes(search.toLowerCase()) ||
    c.name_ar.toLowerCase().includes(search.toLowerCase()) ||
    c.code_en.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-container">Loading academic courses...</div>;

  return (
    <div className="admin-page animate-in">
      <div className="page-header">
        <div className="title-section">
          <h1>Course Management</h1>
          <p className="breadcrumb">Admin · Management · Courses</p>
        </div>
        <div className="action-bar">
          <button className="btn-add" onClick={handleAdd}>
            <span>+</span> Add Course
          </button>
        </div>
      </div>

      <div className="level-tabs-container" style={{ display: 'flex', gap: '10px', marginBottom: '25px', background: '#f1f5f9', padding: '6px', borderRadius: '18px', width: 'fit-content' }}>
        {[1, 2, 3, 4].map(level => (
          <button
            key={level}
            onClick={() => setActiveLevel(level)}
            style={{
              padding: '10px 20px',
              borderRadius: '14px',
              border: 'none',
              fontWeight: '800',
              cursor: 'pointer',
              transition: '0.3s',
              background: activeLevel === parseInt(level) ? 'white' : 'transparent',
              color: activeLevel === parseInt(level) ? '#4f46e5' : '#64748b',
              boxShadow: activeLevel === parseInt(level) ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            Level {level}
          </button>
        ))}
      </div>

      <div className="data-section">
        <div className="toolbar" style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
          <div className="search-box" style={{ flex: 1 }}>
            <span className="search-icon">🔍</span>
            <input
              placeholder="Search by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="dept-filter" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontWeight: '700', color: '#64748b', fontSize: '13px' }}>Department:</span>
            <select
              value={activeDept}
              onChange={(e) => setActiveDept(e.target.value)}
              style={{ padding: '10px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: '600', outline: 'none' }}
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name_en}</option>)}
            </select>
          </div>
        </div>

        <div className="table-wrapper card-style">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Status</th>
                <th>Name</th>
                <th>Hrs / L-P</th>
                <th>Level</th>
                <th>Type</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id} style={{ opacity: course.is_available ? 1 : 0.6 }}>
                  <td><strong>{course.code_en}</strong></td>
                  <td>
                    <span className={`status-pill ${course.is_available ? 'active' : 'suspended'}`} style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      background: course.is_available ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: course.is_available ? '#10b981' : '#ef4444',
                      textTransform: 'uppercase'
                    }}>
                      {course.is_available ? 'Available' : 'Stopped'}
                    </span>
                  </td>
                  <td>
                    <div>{course.name_en}</div>
                    <small style={{ color: '#999' }}>{course.name_ar}</small>
                    {course.assigned_professor && (
                      <div style={{ marginTop: '6px', fontSize: '11px', color: '#4f46e5', background: '#eef2ff', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', fontWeight: 'bold' }}>
                        👨‍🏫 {course.assigned_professor.name_en || course.assigned_professor.name_ar}
                      </div>
                    )}
                  </td>
                  <td>{course.credit_hours}h ({course.lecture_hrs}-{course.lab_hrs})</td>
                  <td>Level {course.level}</td>
                  <td>
                    <span className={`tag-${course.course_type}`}>
                      {course.course_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    {course.department ? course.department.name_en : <span style={{ color: '#999' }}>General</span>}
                  </td>
                  <td className="table-actions">
                    <button className="action-btn assign" title="Assign Professor" onClick={() => handleOpenAssign(course)}>👤</button>
                    <button className="action-btn edit" onClick={() => handleEdit(course)}>✏️</button>
                    <button className="action-btn delete" onClick={() => handleDelete(course.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCourses.length === 0 && (
          <div className="empty-state">No courses found matching your criteria.</div>
        )}
      </div>

      {showForm && (
        <CourseFormModal
          editing={editing}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          setShowForm={setShowForm}
          departments={departments}
        />
      )}
      {showAssignModal && (
        <div className="modal">
          <div className="modal-content glass-effect animate-in">
            <div className="modal-header">
              <h3>Assign Professor</h3>
              <p className="subtitle">Choose a professor for this course.</p>
            </div>
            <form onSubmit={handleAssignSubmit}>
              <div className="form-group">
                <label>Professor</label>
                <select
                  value={assignData.professor_id}
                  onChange={(e) => setAssignData({ ...assignData, professor_id: e.target.value })}
                  required
                >
                  <option value="">Select Professor...</option>
                  {professors.map(p => <option key={p.id} value={p.id}>{p.name_en} ({p.name_ar})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Semester</label>
                <select
                  value={assignData.semester_id}
                  onChange={(e) => setAssignData({ ...assignData, semester_id: e.target.value })}
                  required
                >
                  {semesters.map(s => <option key={s.id} value={s.id}>{s.year} - {s.term} {s.is_active ? '(Active)' : ''}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Assign</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

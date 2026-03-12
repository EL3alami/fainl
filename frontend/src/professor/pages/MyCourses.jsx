import { useState, useEffect } from "react";
import { professorsApi } from "../../services/api";
import "./ProfessorPages.css";
import "../ProfessorLayout.css";

export default function MyCourses() {
  const [myCourses, setMyCourses] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profId, setProfId] = useState(null);
  const [editingGrades, setEditingGrades] = useState({});
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.info) {
      setProfId(user.info.id);
      fetchMyCourses(user.info.id);
    }
  }, []);

  const fetchMyCourses = async (id) => {
    try {
      const data = await professorsApi.getMyCourses(id);
      setMyCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudents = async (assignment) => {
    setSelectedAssignment(assignment);
    try {
      const students = await professorsApi.getCourseStudents(
        profId,
        assignment.course_id,
        assignment.semester_id
      );
      setCourseStudents(students);
      // Initialize local editing state for each student
      const initialGrades = {};
      students.forEach(s => {
        initialGrades[s.id] = {
          midterm_grade: s.midterm_grade || 0,
          practical_grade: s.practical_grade || 0,
          year_work_grade: s.year_work_grade || 0,
          final_exam_grade: s.final_exam_grade || 0,
        };
      });
      setEditingGrades(initialGrades);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGradeInputChange = (enrollmentId, field, value) => {
    setEditingGrades(prev => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const calculateTotalGrade = (enrollmentId) => {
    const grades = editingGrades[enrollmentId];
    if (!grades) return 0;
    return (parseFloat(grades.midterm_grade) || 0) +
      (parseFloat(grades.practical_grade) || 0) +
      (parseFloat(grades.year_work_grade) || 0) +
      (parseFloat(grades.final_exam_grade) || 0);
  };

  const handleSaveGrades = async (enrollmentId) => {
    const target = editingGrades[enrollmentId];
    try {
      await professorsApi.updateGrades({
        enrollment_id: enrollmentId,
        midterm_grade: target.midterm_grade,
        practical_grade: target.practical_grade,
        year_work_grade: target.year_work_grade,
        final_exam_grade: target.final_exam_grade
      });
      setFeedback({ type: 'success', message: 'Grades saved successfully!' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to save grades.' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  if (loading) return <div className="loading-container">Fetching your courses...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="title-section">
          <h1>Managed Courses</h1>
          <p className="breadcrumb">Professor · Management · Courses</p>
        </div>
      </div>

      {feedback && (
        <div className={`alert ${feedback.type === 'success' ? 'success-alert' : 'error-alert'} animate-in`}>
          {feedback.message}
        </div>
      )}

      <div className="table-wrapper animate-in">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Semester</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {myCourses.map((assignment) => (
              <tr key={assignment.id}>
                <td>
                  <div className="name-cell">
                    <span className="main-name">{assignment.course?.name_en}</span>
                    <span className="sub-email">{assignment.course?.code_en}</span>
                  </div>
                </td>
                <td>{assignment.semester?.year} - {assignment.semester?.term}</td>
                <td><span className="status-tag active">Assigned</span></td>
                <td>
                  <button className="btn-primary" onClick={() => handleViewStudents(assignment)}>
                    📄 Manage Grades
                  </button>
                </td>
              </tr>
            ))}
            {myCourses.length === 0 && (
              <tr><td colSpan="4" className="empty-state">No courses currently assigned to you.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedAssignment && (
        <div className="data-section animate-in" style={{ marginTop: '40px' }}>
          <div className="page-header" style={{ marginBottom: '20px' }}>
            <h2>Students: {selectedAssignment.course?.name_en}</h2>
          </div>
          <div className="table-wrapper">
            <table className="admin-table grading-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Midterm (15)</th>
                  <th>Practical (15)</th>
                  <th>Year Work (10)</th>
                  <th>Final (60)</th>
                  <th>Total (100)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {courseStudents.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td>
                      <div className="name-cell">
                        <span className="main-name">{enrollment.student?.name_en}</span>
                        <span className="sub-email">ID: {enrollment.student?.student_number}</span>
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        max="15"
                        className="grade-input"
                        value={editingGrades[enrollment.id]?.midterm_grade ?? ""}
                        onChange={(e) => handleGradeInputChange(enrollment.id, 'midterm_grade', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        max="15"
                        className="grade-input"
                        value={editingGrades[enrollment.id]?.practical_grade ?? ""}
                        onChange={(e) => handleGradeInputChange(enrollment.id, 'practical_grade', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        max="10"
                        className="grade-input"
                        value={editingGrades[enrollment.id]?.year_work_grade ?? ""}
                        onChange={(e) => handleGradeInputChange(enrollment.id, 'year_work_grade', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        max="60"
                        className="grade-input"
                        value={editingGrades[enrollment.id]?.final_exam_grade ?? ""}
                        onChange={(e) => handleGradeInputChange(enrollment.id, 'final_exam_grade', e.target.value)}
                      />
                    </td>
                    <td>
                      <span className="grade-total">
                        {calculateTotalGrade(enrollment.id) || 0} / 100
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-save-sm"
                        onClick={() => handleSaveGrades(enrollment.id)}
                      >
                        💾 Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        .grade-input {
          width: 70px;
          padding: 6px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          text-align: center;
        }
        .grade-input:focus {
          border-color: #4f46e5;
          outline: none;
        }
        .grade-total {
          font-weight: 800;
          padding: 6px 12px;
          border-radius: 8px;
        }
        .pass { color: #166534; font-weight: bold; }
        .fail { color: #991b1b; font-weight: bold; }
        .btn-save-sm {
          padding: 6px 10px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
        }
        .btn-save-sm:hover { background: #4338ca; }

        .alert {
          padding: 10px 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 600;
        }
        .success-alert {
          background-color: #dcfce7;
          color: #166534;
          border: 1px solid #34d399;
        }
        .error-alert {
          background-color: #fee2e2;
          color: #991b1b;
          border: 1px solid #ef4444;
        }
      `}</style>
    </div>
  );
}

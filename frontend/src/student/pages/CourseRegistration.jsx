import { useState, useEffect } from "react";
import { registrationApi, studentsApi } from "../../services/api";
import { withStudentVerification } from "./studentAuth";
import "../../admin/pages/AdminPages.css";
import "./CourseRegistration.css";

function CourseRegistrationContent({ studentSession }) {
  const sessionStudent = studentSession?.student;
  const semester = studentSession?.semester;
  const [student, setStudent] = useState(sessionStudent);

  const [availableCourses, setAvailableCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStudent?.id) fetchAcademicData();
  }, [sessionStudent]);

  const fetchAcademicData = async () => {
    try {
      setLoading(true);
      const [available, registered, freshStudent] = await Promise.all([
        registrationApi.getAvailable(sessionStudent.id),
        registrationApi.getMyCourses(sessionStudent.id),
        studentsApi.get(sessionStudent.id).catch(() => null)
      ]);
      setAvailableCourses(available);
      setMyEnrollments(registered);
      if (freshStudent) {
        setStudent(freshStudent);
      }
    } catch (err) {
      console.error("Failed to fetch academic data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (courseId) => {
    if (!semester) {
      alert("No active registration period.");
      return;
    }
    try {
      setLoading(true);
      await registrationApi.register({
        student_id: student.id,
        course_id: courseId,
        semester_id: semester.id,
      });
      alert("Course registered successfully!");
      fetchAcademicData();
    } catch (err) {
      alert(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page student-reg-page animate-in">
      {/* Header Banner */}
      <div className="reg-header-banner glass-effect">
        <div className="student-quick-info">
          <div className="student-avatar">{student?.name_en?.charAt(0)}</div>
          <div>
            <h1>Course Registration</h1>
            <p>
              {student?.name_en} · {student?.department?.name_en} · Level {student?.level}
            </p>
          </div>
        </div>
        <div className="academic-stats">
          <div className="reg-stat-card">
            <span className="label">GPA</span>
            <span className="value">{parseFloat(student?.cgpa || 0).toFixed(2)}</span>
          </div>
          {semester && (
            <div className="reg-stat-card">
              <span className="label">Semester</span>
              <span className="value">
                {semester.year} - {semester.term}
              </span>
            </div>
          )}
          <div className="reg-stat-card">
            <span className="label">Registered Hrs</span>
            <span className="value">
              {myEnrollments.reduce((s, e) => s + (e.course?.credit_hours || 0), 0)}
            </span>
          </div>
        </div>
      </div>

      {!semester && (
        <div
          style={{
            padding: "16px 24px",
            background: "rgba(245, 158, 11, 0.1)",
            borderRadius: 14,
            color: "#f59e0b",
            fontWeight: 700,
            marginBottom: 30,
            border: "1px solid rgba(245, 158, 11, 0.2)",
          }}
        >
          ⚠️ No active registration period at this time. Please check back later.
        </div>
      )}

      <div className="registration-layout">
        {/* Available Courses */}
        <div className="available-section">
          <div className="section-title-box">
            <h2>Available Courses</h2>
            <p>Courses matching your level and prerequisites</p>
          </div>

          {loading ? (
            <p style={{ color: "#94a3b8" }}>Loading courses...</p>
          ) : (
            <div className="courses-grid">
              {availableCourses.length === 0 ? (
                <div className="empty-reg-state">
                  No available courses for registration at this time.
                </div>
              ) : (
                availableCourses.map((course) => (
                  <div key={course.id} className="course-reg-card">
                    <div
                      className="course-type-pill"
                      data-type={course.course_type || "general_mandatory"}
                    >
                      {(course.course_type || "course").replace("_", " ")}
                    </div>
                    <h3>{course.name_en}</h3>
                    <p className="course-code">{course.code_en}</p>
                    <div className="course-meta">
                      <span>
                        <strong>Credits:</strong> {course.credit_hours}h
                      </span>
                      <span>
                        <strong>Level:</strong> {course.level}
                      </span>
                    </div>
                    <button
                      className="btn-register-course"
                      onClick={() => handleRegister(course.id)}
                      disabled={loading || !semester}
                    >
                      + Register Course
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* My Registered Courses Sidebar */}
        <div className="my-schedule-sidebar">
          <div className="sidebar-sticky">
            <div className="section-title-box">
              <h2>My Registration</h2>
              <p>Courses you've enrolled in this term</p>
            </div>

            <div className="registered-list">
              {myEnrollments.length === 0 ? (
                <div className="empty-mini-state">No courses registered yet.</div>
              ) : (
                myEnrollments.map((item) => (
                  <div key={item.id} className="mini-course-card">
                    <div className="mini-info">
                      <strong>{item.course?.code_en}</strong>
                      <span>{item.course?.name_en}</span>
                    </div>
                    <div className="mini-meta">
                      {item.course?.credit_hours} Credits
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="reg-footer-summary">
              <div className="total-h-row">
                <span>Total Registered Hours:</span>
                <strong>
                  {myEnrollments.reduce(
                    (s, e) => s + (e.course?.credit_hours || 0),
                    0
                  )}{" "}
                  Hrs
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withStudentVerification(CourseRegistrationContent);

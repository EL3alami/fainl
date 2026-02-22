import { useState } from "react";
import "../../admin/pages/AdminPages.css";
import "./CourseRegistration.css"; // Add a new CSS file for custom styles

export default function CourseRegistration() {
  const [isVerified, setIsVerified] = useState(false);
  const [nationalID, setNationalID] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [gpa, setGPA] = useState(null);
  const [availableCourses] = useState([
    { id: 1, name: "Data Structures", code: "CS201", department: "CS", credits: 3, professor: "Dr. Ali Hassan", schedule: "Sunday 10:00-12:00" },
    { id: 2, name: "Database Systems", code: "CS202", department: "CS", credits: 3, professor: "Dr. Mona Sami", schedule: "Monday 10:00-12:00" },
    { id: 3, name: "Web Development", code: "CS203", department: "CS", credits: 3, professor: "Dr. Ahmed Mostafa", schedule: "Tuesday 10:00-12:00" },
    { id: 4, name: "Operating Systems", code: "CS204", department: "CS", credits: 3, professor: "Dr. Ali Hassan", schedule: "Wednesday 10:00-12:00" },
  ]);

  const [registeredCourses, setRegisteredCourses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("studentCourses") || "[]");
    } catch {
      return [];
    }
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleRegister = (course) => {
    if (registeredCourses.find((c) => c.id === course.id)) {
      alert("You are already registered for this course!");
      return;
    }

    const newRegistration = [...registeredCourses, course];
    setRegisteredCourses(newRegistration);
    localStorage.setItem("studentCourses", JSON.stringify(newRegistration));
    alert(`Successfully registered for ${course.name}!`);
  };

  const handleVerification = () => {
    // Simulate verification logic
    if (nationalID && studentCode) {
      // Simulate fetching GPA from database
      const fetchedGPA = 3.75; // Replace with actual API call or database query
      setGPA(fetchedGPA);
      setShowSuccess(true);
      setTimeout(() => setIsVerified(true), 2000); // Transition after 2 seconds
    } else {
      alert("Please enter both National ID and Student Code.");
    }
  };

  if (!isVerified) {
    if (showSuccess) {
      return (
        <div className="verification-modal success">
          <h2>Verification Successful!</h2>
          <p>Redirecting to course registration...</p>
        </div>
      );
    }

    return (
      <div className="verification-modal">
        <h2>Student Verification</h2>
        <label>
          National ID:
          <input
            type="text"
            value={nationalID}
            onChange={(e) => setNationalID(e.target.value)}
            placeholder="Enter your National ID"
          />
        </label>
        <label>
          Student Code:
          <input
            type="text"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            placeholder="Enter your Student Code"
          />
        </label>
        <button className="btn-verify" onClick={handleVerification}>Verify</button>
      </div>
    );
  }

  const available = availableCourses.filter(
    (c) => !registeredCourses.find((rc) => rc.id === c.id)
  );

  return (
    <div className="admin-page">
      <h1>Course Registration</h1>
      <p className="gpa-display">Your GPA: <span>{gpa}</span></p>

      <div className="courses-section">
        <h2>Available Courses</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Credits</th>
              <th>Professor</th>
              <th>Schedule</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {available.map((course) => (
              <tr key={course.id}>
                <td>{course.code}</td>
                <td>{course.name}</td>
                <td>{course.credits}</td>
                <td>{course.professor}</td>
                <td>{course.schedule}</td>
                <td>
                  <button
                    className="btn-add"
                    onClick={() => handleRegister(course)}
                  >
                    Register
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="registered-courses-section">
        <h2>My Registered Courses ({registeredCourses.length})</h2>
        {registeredCourses.length === 0 ? (
          <p>No courses registered yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Credits</th>
                <th>Professor</th>
                <th>Schedule</th>
              </tr>
            </thead>
            <tbody>
              {registeredCourses.map((course) => (
                <tr key={course.id}>
                  <td>{course.code}</td>
                  <td>{course.name}</td>
                  <td>{course.credits}</td>
                  <td>{course.professor}</td>
                  <td>{course.schedule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

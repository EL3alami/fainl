import { useState, useEffect } from "react";
import "../../admin/pages/AdminPages.css";

export default function MySchedule() {
  const [professorName] = useState("Dr. Ali Hassan");
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    // Load professor's schedule from courses
    const allCourses = JSON.parse(localStorage.getItem("studentCourses") || "[]");
    const professorCourses = allCourses.filter(
      (c) => c.professor === professorName
    );

    const uniqueCourses = [];
    const courseMap = new Map();
    professorCourses.forEach((course) => {
      if (!courseMap.has(course.id)) {
        courseMap.set(course.id, course);
        const scheduleParts = course.schedule.split(" ");
        uniqueCourses.push({
          id: course.id,
          course: course.name,
          code: course.code,
          day: scheduleParts[0],
          time: scheduleParts.slice(1).join(" "),
          room: "Lab " + (course.id % 5 + 1),
        });
      }
    });

    const dayOrder = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4 };
    uniqueCourses.sort((a, b) => (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99));
    setSchedule(uniqueCourses);
  }, [professorName]);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

  return (
    <div className="admin-page">
      <h1>My Class Schedule</h1>

      {schedule.length === 0 ? (
        <p>No courses assigned yet.</p>
      ) : (
        <>
          <div style={{ marginBottom: "30px" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Course</th>
                  <th>Course Code</th>
                  <th>Room</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((cls) => (
                  <tr key={cls.id}>
                    <td><strong>{cls.day}</strong></td>
                    <td>{cls.time}</td>
                    <td>{cls.course}</td>
                    <td>{cls.code}</td>
                    <td>{cls.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
            {days.map((day) => {
              const dayClasses = schedule.filter((cls) => cls.day === day);
              return (
                <div
                  key={day}
                  style={{
                    background: "white",
                    padding: "15px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <h3 style={{ marginTop: 0, color: "#667eea" }}>{day}</h3>
                  {dayClasses.length === 0 ? (
                    <p style={{ color: "#999", fontSize: "14px" }}>No classes</p>
                  ) : (
                    dayClasses.map((cls) => (
                      <div
                        key={cls.id}
                        style={{
                          marginBottom: "10px",
                          padding: "10px",
                          background: "#f8f9fa",
                          borderRadius: "4px",
                        }}
                      >
                        <strong>{cls.course}</strong>
                        <br />
                        <small>{cls.time}</small>
                        <br />
                        <small>{cls.room}</small>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

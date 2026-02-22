import { useState, useEffect } from "react";
import "../../admin/pages/AdminPages.css";

export default function ClassSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [registeredCourses, setRegisteredCourses] = useState([]);

  useEffect(() => {
    const courses = JSON.parse(localStorage.getItem("studentCourses") || "[]");
    setRegisteredCourses(courses);

    // Generate schedule from registered courses
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
    const scheduleData = courses.map((course) => {
      const scheduleParts = course.schedule.split(" ");
      const day = scheduleParts[0];
      const time = scheduleParts.slice(1).join(" ");
      return {
        id: course.id,
        course: course.name,
        code: course.code,
        day: day,
        time: time,
        room: "Lab " + (course.id % 5 + 1),
        professor: course.professor,
      };
    });

    // Sort by day
    const dayOrder = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4 };
    scheduleData.sort((a, b) => (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99));
    setSchedule(scheduleData);
  }, []);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

  return (
    <div className="admin-page">
      <h1>Class Schedule</h1>

      {schedule.length === 0 ? (
        <p>No courses registered. Please register for courses first.</p>
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
                  <th>Professor</th>
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
                    <td>{cls.professor}</td>
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

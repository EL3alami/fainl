import { useState } from "react";
import "./AdminPages.css";

export default function Schedules() {
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      department: "Computer Science",
      course: "Data Structures",
      day: "Sunday",
      time: "10:00 - 12:00",
      room: "Lab 1",
      doctor: "Dr. Ahmed",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [formData, setFormData] = useState({
    department: "",
    course: "",
    day: "",
    time: "",
    room: "",
    doctor: "",
  });

  const handleAdd = () => {
    setEditing(null);
    setFormData({
      department: "",
      course: "",
      day: "",
      time: "",
      room: "",
      doctor: "",
    });
    setShowForm(true);
  };

  const handleEdit = (schedule) => {
    setEditing(schedule);
    setFormData(schedule);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setSchedules(schedules.filter((s) => s.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editing) {
      setSchedules(
        schedules.map((s) =>
          s.id === editing.id ? { ...formData, id: s.id } : s
        )
      );
    } else {
      setSchedules([...schedules, { ...formData, id: Date.now() }]);
    }

    setShowForm(false);
  };

  return (
    <div className="admin-page">
      <h1>Manage Schedules</h1>

      <button className="btn-add" onClick={handleAdd}>
        Add Schedule
      </button>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Department</th>
            <th>Course</th>
            <th>Day</th>
            <th>Time</th>
            <th>Room</th>
            <th>Doctor</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {schedules.map((s) => (
            <tr key={s.id}>
              <td>{s.department}</td>
              <td>{s.course}</td>
              <td>{s.day}</td>
              <td>{s.time}</td>
              <td>{s.room}</td>
              <td>{s.doctor}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(s)}>
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(s.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== Modal (نفس Courses بالظبط) ===== */}
      {showForm && (
        <div className="modal">
          <form className="modal-content" onSubmit={handleSubmit}>
            <h3>{editing ? "Edit Schedule" : "Add Schedule"}</h3>

            <input
              placeholder="Department"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              required
            />

            <input
              placeholder="Course"
              value={formData.course}
              onChange={(e) =>
                setFormData({ ...formData, course: e.target.value })
              }
              required
            />

            <input
              placeholder="Day"
              value={formData.day}
              onChange={(e) =>
                setFormData({ ...formData, day: e.target.value })
              }
              required
            />

            <input
              placeholder="Time"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              required
            />

            <input
              placeholder="Room"
              value={formData.room}
              onChange={(e) =>
                setFormData({ ...formData, room: e.target.value })
              }
              required
            />

            <input
              placeholder="Doctor"
              value={formData.doctor}
              onChange={(e) =>
                setFormData({ ...formData, doctor: e.target.value })
              }
              required
            />

            <div className="modal-actions">
              <button className="btn-add">Save</button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}


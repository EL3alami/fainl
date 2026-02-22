import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "./AdminPages.css";

export default function Students() {
  const [students, setStudents] = useState([
    { id: 1, name: "Ahmed Ali", nationalId: "12345678901234", email: "ahmed@example.com", department: "CS", password: "pass123", level: "Level 1" },
    { id: 2, name: "Mona Sami", nationalId: "98765432109876", email: "mona@example.com", department: "Math", password: "mona456", level: "Level 2" },
  ]);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [importMessage, setImportMessage] = useState("");

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    nationalId: "",
    email: "",
    department: "",
    password: "",
    level: "Level 1",
  });
  const navigate = useNavigate();
  const { level } = useParams();

  const getNextId = () => {
    const ids = students.map((s) => Number(s.id) || 0);
    const max = ids.length ? Math.max(...ids) : 0;
    return max + 1;
  };

  // Add
  const handleAdd = () => {
    setEditing(null);
    setFormData({ id: "", name: "", nationalId: "", email: "", department: "", password: "", level: level || "Level 1" });
    setShowForm(true);
  };

  // Edit
  const handleEdit = (student) => {
    setEditing(student);
    setFormData(student);
    setShowForm(true);
  };

  // Save
  const handleSubmit = (e) => {
    e.preventDefault();

    if (editing) {
      setStudents(
        students.map((s) =>
          s.id === editing.id ? { ...formData, id: s.id } : s
        )
      );
    } else {
      const newId = getNextId();
      setStudents([...students, { ...formData, id: newId }]);
    }

    setShowForm(false);
  };

  // Delete
  const handleDelete = (id) => {
    setStudents(students.filter((s) => s.id !== id));
  };

  // Excel Import Handler
  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          setImportMessage("Excel file is empty!");
          setTimeout(() => setImportMessage(""), 3000);
          return;
        }

        // Map Excel columns to student data
        // Supports: Name, Email, Department (case-insensitive)
        const startId = getNextId();
        const importedStudents = jsonData.map((row, index) => {
          const nameKey = Object.keys(row).find(
            (key) => key.toLowerCase().includes("name")
          );
          const emailKey = Object.keys(row).find(
            (key) => key.toLowerCase().includes("email")
          );
          const deptKey = Object.keys(row).find(
            (key) =>
              key.toLowerCase().includes("department") ||
              key.toLowerCase().includes("dept")
          );
          const passwordKey = Object.keys(row).find((key) =>
            key.toLowerCase().includes("password") || key.toLowerCase().includes("pass")
          );
          const levelKey = Object.keys(row).find((key) =>
            key.toLowerCase().includes("level")
          );
          const nationalKey = Object.keys(row).find((key) =>
            key.toLowerCase().includes("national") || key.toLowerCase().includes("nid") || key.toLowerCase().includes("قومي")
          );

          return {
            id: startId + index,
            name: row[nameKey] || row[Object.keys(row)[0]] || `Student ${index + 1}`,
            nationalId: row[nationalKey] || "",
            email: row[emailKey] || row[Object.keys(row)[1]] || "",
            department: row[deptKey] || row[Object.keys(row)[2]] || "",
            password: row[passwordKey] || "",
            level: row[levelKey] || "Level 1",
          };
        });

        setStudents([...students, ...importedStudents]);
        setImportMessage(
          `Successfully imported ${importedStudents.length} student(s)!`
        );
        setTimeout(() => setImportMessage(""), 3000);

        // Reset file input
        e.target.value = "";
      } catch (error) {
        setImportMessage("Error reading Excel file: " + error.message);
        setTimeout(() => setImportMessage(""), 3000);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Excel Export Handler
  const handleExcelExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "students.xlsx");
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.nationalId || "").toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = level ? s.level === level : true;
    return matchesSearch && matchesLevel;
  });
  const modalElement = (
    <>
      {showForm && (
        <div className="modal">
          <form className="modal-content" onSubmit={handleSubmit}>
            <h3>{editing ? "Edit Student" : "Add Student"}</h3>

            <input
              placeholder="ID"
              type="number"
              value={formData.id}
              onChange={(e) =>
                setFormData({ ...formData, id: e.target.value })
              }
              required
            />

            <input
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <input
              placeholder="National ID"
              value={formData.nationalId}
              onChange={(e) =>
                setFormData({ ...formData, nationalId: e.target.value })
              }
              required
            />

            <input
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />

            {(formData.level !== "Level 1" && formData.level !== "Level 2") && (
              <input
                placeholder="Department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                required
              />
            )}

            <select
              value={formData.level}
              onChange={(e) => {
                const selectedLevel = e.target.value;
                if (selectedLevel === "Level 1" || selectedLevel === "Level 2") {
                  setFormData({ ...formData, level: selectedLevel, department: "" });
                } else {
                  setFormData({ ...formData, level: selectedLevel });
                }
              }}
              style={{ padding: "8px", borderRadius: 4, marginTop: 8 }}
            >
              <option>Level 1</option>
              <option>Level 2</option>
              <option>Level 3</option>
              <option>Level 4</option>
            </select>

            <input
              placeholder="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <div className="modal-actions">
              <button type="submit" className="btn-add">
                Save
              </button>
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
    </>
  );

  if (!level) {
    return (
      <div className="admin-page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1>Students by Level</h1>
          <button className="btn-add" onClick={handleAdd}>Add Student</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 20 }}>
          {["Level 1", "Level 2", "Level 3", "Level 4"].map((lvl) => (
            <Link
              key={lvl}
              to={encodeURIComponent(lvl)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                border: "1px solid #ccc",
                borderRadius: 8,
                textDecoration: "none",
                color: "black",
                background: "white",
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>{lvl}</h3>
                <p style={{ marginTop: 6, color: "gray" }}>{students.filter(s => s.level === lvl).length} student(s)</p>
              </div>
            </Link>
          ))}
        </div>
        {modalElement}
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>Manage Students — {level}</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
        <button className="btn-add" onClick={handleAdd}>
          Add Student
        </button>
        
        <label className="btn-import" style={{
          background: "#0d6efd",
          color: "white",
          border: "none",
          padding: "8px 14px",
          borderRadius: "5px",
          cursor: "pointer",
          display: "inline-block",
        }}>
          Import Excel
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelImport}
            style={{ display: "none" }}
          />
        </label>

        <button
          className="btn-export"
          onClick={handleExcelExport}
          style={{
            background: "#6c757d",
            color: "white",
            border: "none",
            padding: "8px 14px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Export Excel
        </button>

        <button onClick={() => navigate('/admin/students')} style={{ marginLeft: 'auto' }}>
          Back to Levels
        </button>
      </div>

      {importMessage && (
        <div
          style={{
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "5px",
            background: importMessage.includes("Error")
              ? "#f8d7da"
              : "#d1e7dd",
            color: importMessage.includes("Error") ? "#721c24" : "#0f5132",
            border: `1px solid ${
              importMessage.includes("Error") ? "#f5c2c7" : "#badbcc"
            }`,
          }}
        >
          {importMessage}
        </div>
      )}

      <input
        className="search-input"
        placeholder="Search Student..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>National ID</th>
            <th>Email</th>
            <th>Password</th>
            {(level !== "Level 1" && level !== "Level 2") && <th>Department</th>}
            <th>Level</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredStudents.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.name}</td>
              <td>{s.nationalId || ""}</td>
              <td>{s.email}</td>
              <td>{s.password || ""}</td>
              {(level !== "Level 1" && level !== "Level 2") && <td>{s.department}</td>}
              <td>{s.level || ""}</td>
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

      {/* FORM */}
      {showForm && (
        <div className="modal">
          <form className="modal-content" onSubmit={handleSubmit}>
            <h3>{editing ? "Edit Student" : "Add Student"}</h3>

            <input
              placeholder="ID"
              type="number"
              value={formData.id}
              onChange={(e) =>
                setFormData({ ...formData, id: e.target.value })
              }
              required
            />

            <input
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <input
              placeholder="National ID"
              value={formData.nationalId}
              onChange={(e) =>
                setFormData({ ...formData, nationalId: e.target.value })
              }
              required
            />

            <input
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />

            {(formData.level !== "Level 1" && formData.level !== "Level 2") && (
              <input
                placeholder="Department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                required
              />
            )}

            <select
              value={formData.level}
              onChange={(e) => {
                const selectedLevel = e.target.value;
                if (selectedLevel === "Level 1" || selectedLevel === "Level 2") {
                  setFormData({ ...formData, level: selectedLevel, department: "" });
                } else {
                  setFormData({ ...formData, level: selectedLevel });
                }
              }}
              style={{ padding: "8px", borderRadius: 4, marginTop: 8 }}
            >
              <option>Level 1</option>
              <option>Level 2</option>
              <option>Level 3</option>
              <option>Level 4</option>
            </select>

            <input
              placeholder="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <div className="modal-actions">
              <button type="submit" className="btn-add">
                Save
              </button>
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

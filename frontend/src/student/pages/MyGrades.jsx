import { useState, useEffect } from "react";
import { gradesApi, studentsApi } from "../../services/api";
import { withStudentVerification } from "./studentAuth";
import "../../admin/pages/AdminPages.css";

const getSymbolColor = (symbol) => {
  if (!symbol) return "#94a3b8";
  if (["A", "A+", "A-"].includes(symbol)) return "#10b981";
  if (["B", "B+", "B-"].includes(symbol)) return "#4f46e5";
  if (["C", "C+", "C-"].includes(symbol)) return "#f59e0b";
  if (["D", "D+"].includes(symbol)) return "#8b5cf6";
  return "#ef4444";
};

function MyGradesContent({ studentSession }) {
  const sessionStudent = studentSession?.student;
  const [student, setStudent] = useState(sessionStudent);
  const [records, setRecords] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [activeSem, setActiveSem] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, [sessionStudent]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const params = `student_id=${sessionStudent.id}`;
      const [res, freshStudent] = await Promise.all([
        gradesApi.getAll(params),
        studentsApi.get(sessionStudent.id).catch(() => null)
      ]);
      const data = res.data || res;
      setRecords(data);
      if (freshStudent) {
        setStudent(freshStudent);
      }

      // Extract unique semesters
      const semMap = {};
      data.forEach(r => {
        if (r.semester) semMap[r.semester.id] = r.semester;
      });
      setSemesters(Object.values(semMap));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = activeSem === "all" ? records : records.filter(r => r.semester_id == activeSem);

  const completed = filtered.filter(r => r.status === "completed" && r.grade_points !== null);
  const totalQP = completed.reduce((s, r) => s + (r.grade_points * (r.course?.credit_hours || 0)), 0);
  const totalHrs = completed.reduce((s, r) => s + (r.course?.credit_hours || 0), 0);
  const semGPA = totalHrs > 0 ? (totalQP / totalHrs).toFixed(3) : "—";

  return (
    <div className="admin-page animate-in">
      <div className="page-header">
        <div className="title-section">
          <h1>My Academic Record</h1>
          <p className="breadcrumb">{student?.name_en} · {student?.department?.name_en}</p>
        </div>
      </div>

      {/* GPA Banner */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 20, marginBottom: 28
      }}>
        {[
          { label: "Cumulative CGPA", value: parseFloat(student?.cgpa || 0).toFixed(3), color: "#4f46e5" },
          { label: "Passed Hours", value: student?.total_passed_hrs || 0, color: "#10b981" },
          { label: "Semester GPA", value: semGPA, color: "#f59e0b" },
          { label: "Semester Hrs", value: totalHrs, color: "#8b5cf6" },
        ].map(c => (
          <div key={c.label} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 18, padding: "22px 26px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.label}</p>
            <h2 style={{ margin: "6px 0 0", fontSize: 32, fontWeight: 800, color: c.color }}>{c.value}</h2>
          </div>
        ))}
      </div>

      {/* Semester Filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveSem("all")}
          style={{
            padding: "8px 20px", borderRadius: 20, border: "2px solid",
            borderColor: activeSem === "all" ? "#4f46e5" : "#e2e8f0",
            background: activeSem === "all" ? "#4f46e5" : "white",
            color: activeSem === "all" ? "white" : "#64748b",
            fontWeight: 700, cursor: "pointer", fontSize: 13
          }}
        >All Semesters</button>
        {semesters.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSem(s.id)}
            style={{
              padding: "8px 20px", borderRadius: 20, border: "2px solid",
              borderColor: activeSem === s.id ? "#4f46e5" : "#e2e8f0",
              background: activeSem === s.id ? "#4f46e5" : "white",
              color: activeSem === s.id ? "white" : "#64748b",
              fontWeight: 700, cursor: "pointer", fontSize: 13
            }}
          >{s.year} - {s.term}</button>
        ))}
      </div>

      {/* Grades Table */}
      <div className="table-wrapper card-style">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Credits</th>
              <th>Midterm</th>
              <th>Practical</th>
              <th>Year Work</th>
              <th>Final</th>
              <th>Total</th>
              <th>Symbol</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}>Loading grades...</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id}>
                <td>
                  <div style={{ fontWeight: 700, color: "#1e293b" }}>{r.course?.name_en}</div>
                  <small style={{ color: "#4f46e5", fontFamily: "monospace", fontWeight: 700 }}>{r.course?.code_en}</small>
                </td>
                <td>{r.course?.credit_hours} hrs</td>
                <td style={{ color: "#64748b" }}>{r.midterm_grade ?? 0}</td>
                <td style={{ color: "#64748b" }}>{r.practical_grade ?? 0}</td>
                <td style={{ color: "#64748b" }}>{r.year_work_grade ?? 0}</td>
                <td style={{ color: "#64748b" }}>{r.final_exam_grade ?? 0}</td>
                <td style={{ fontWeight: 800, fontSize: 18 }}>{r.grade !== null ? `${r.grade}/100` : "—"}</td>
                <td>
                  {r.grade_symbol ? (
                    <span style={{
                      padding: "5px 14px", borderRadius: 10,
                      background: `${getSymbolColor(r.grade_symbol)}1A`,
                      color: getSymbolColor(r.grade_symbol),
                      fontWeight: 800, fontSize: 14
                    }}>
                      {r.grade_symbol}
                    </span>
                  ) : <span style={{ color: "#94a3b8" }}>Pending</span>}
                </td>
                <td>
                  <span className={`tag-${r.status === "completed" ? "dept_mandatory" : "general_mandatory"}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="empty-state">No academic records found for this period.</div>
        )}
      </div>
    </div>
  );
}

export default withStudentVerification(MyGradesContent);

import { useState, useEffect } from "react";
import { professorsApi, coursesApi, semestersApi } from "../../services/api";
import "./AdminPages.css";

export default function Assignments() {
    const [assignments, setAssignments] = useState([]);
    const [professors, setProfessors] = useState([]);
    const [courses, setCourses] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        professor_id: "",
        course_id: "",
        semester_id: "",
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [assigns, profs, crs, sems] = await Promise.all([
                professorsApi.getAllAssignments(),
                professorsApi.getAll(),
                coursesApi.getAll(),
                semestersApi.getAll(),
            ]);
            setAssignments(assigns);
            setProfessors(profs);
            setCourses(crs);
            setSemesters(sems);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await professorsApi.assignCourse(formData);
            setShowForm(false);
            fetchData();
        } catch (err) {
            alert(err.message || "Assignment failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this assignment?")) return;
        try {
            await professorsApi.deleteAssignment(id);
            fetchData();
        } catch (err) {
            alert(err.message || "Removal failed");
        }
    };

    if (loading) return <div className="loading-container">Loading Assignments...</div>;

    return (
        <div className="admin-page animate-in">
            <div className="page-header">
                <div className="title-section">
                    <h1>Course Assignments</h1>
                    <p className="breadcrumb">Admin · Management · Assignments</p>
                </div>
                <div className="action-bar">
                    <button className="btn-add" onClick={() => setShowForm(true)}>
                        <span>+</span> Assign Professor
                    </button>
                </div>
            </div>

            <div className="data-section">
                <div className="table-wrapper card-style">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Professor</th>
                                <th>Course</th>
                                <th>Semester</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map((as) => (
                                <tr key={as.id}>
                                    <td>
                                        <div className="name-cell">
                                            <span className="main-name">{as.professor?.name_en}</span>
                                            <span className="sub-email">{as.professor?.title}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="name-cell">
                                            <span className="main-name">{as.course?.name_en}</span>
                                            <span className="sub-email">{as.course?.code_en}</span>
                                        </div>
                                    </td>
                                    <td>{as.semester?.year} - {as.semester?.term}</td>
                                    <td className="table-actions">
                                        <button className="action-btn delete" onClick={() => handleDelete(as.id)}>🗑️</button>
                                    </td>
                                </tr>
                            ))}
                            {assignments.length === 0 && (
                                <tr><td colSpan="4" className="empty-state">No assignments found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <div className="modal">
                    <div className="modal-content glass-effect animate-in">
                        <div className="modal-header">
                            <h3>New Course Assignment</h3>
                            <p className="subtitle">Link a professor to a course for a specific semester.</p>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Select Professor</label>
                                <select
                                    value={formData.professor_id}
                                    onChange={(e) => setFormData({ ...formData, professor_id: e.target.value })}
                                    required
                                >
                                    <option value="">Choose Professor...</option>
                                    {professors.map(p => <option key={p.id} value={p.id}>{p.name_en} ({p.name_ar})</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Select Course</label>
                                <select
                                    value={formData.course_id}
                                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                                    required
                                >
                                    <option value="">Choose Course...</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.code_en} - {c.name_en}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Select Semester</label>
                                <select
                                    value={formData.semester_id}
                                    onChange={(e) => setFormData({ ...formData, semester_id: e.target.value })}
                                    required
                                >
                                    <option value="">Choose Semester...</option>
                                    {semesters.map(s => <option key={s.id} value={s.id}>{s.year} - {s.term}</option>)}
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">Confirm Assignment</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

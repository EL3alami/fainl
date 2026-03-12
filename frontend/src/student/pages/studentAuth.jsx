import { useState } from "react";
import { registrationApi } from "../../services/api";
import "../../admin/pages/AdminPages.css";
import "../StudentLayout.css";

// This context-like helper stores the verified student session in sessionStorage
export function getStudentSession() {
    try {
        return JSON.parse(sessionStorage.getItem("student_session") || "null");
    } catch {
        return null;
    }
}

export function setStudentSession(student) {
    sessionStorage.setItem("student_session", JSON.stringify(student));
}

export function clearStudentSession() {
    sessionStorage.removeItem("student_session");
}

// Verification Gate component — wraps any student page
export function withStudentVerification(WrappedComponent) {
    return function VerifiedStudentPage(props) {
        const [session, setSession] = useState(getStudentSession);
        const [nationalID, setNationalID] = useState("");
        const [studentCode, setStudentCode] = useState("");
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");

        const handleVerify = async (e) => {
            e.preventDefault();
            setError("");
            try {
                setLoading(true);
                const res = await registrationApi.verify({ national_id: nationalID, student_number: studentCode });
                setStudentSession(res);
                setSession(res);
            } catch (err) {
                setError(err.message || "Verification failed. Check your credentials.");
            } finally {
                setLoading(false);
            }
        };

        if (!session) {
            return (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: 20 }}>
                    <div style={{
                        background: "white", borderRadius: 24, padding: 44, maxWidth: 430, width: "100%",
                        boxShadow: "0 20px 50px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0"
                    }}>
                        <div style={{ textAlign: "center", marginBottom: 30 }}>
                            <div style={{ fontSize: 32, marginBottom: 16, fontWeight: 1000, color: '#4f46e5' }}>EP</div>
                            <h2 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 800, color: "#1e293b" }}>Edu_Point Student Portal</h2>
                            <p style={{ color: "#64748b", margin: 0 }}>Smart Access to Academic Insights</p>
                        </div>

                        <form onSubmit={handleVerify}>
                            <div className="form-group" style={{ marginBottom: 16 }}>
                                <label>National ID</label>
                                <input placeholder="14-digit national ID" value={nationalID} onChange={e => setNationalID(e.target.value)} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: 20 }}>
                                <label>Student Number</label>
                                <input placeholder="e.g. 20240001" value={studentCode} onChange={e => setStudentCode(e.target.value)} required />
                            </div>
                            {error && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12, padding: "10px 14px", background: "rgba(239,68,68,0.07)", borderRadius: 10 }}>{error}</div>}
                            <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
                                {loading ? "Verifying Access..." : "Enter Edu_Point"}
                            </button>
                        </form>

                        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#94a3b8" }}>
                            Edu_Point Systems · Secure Academic Protocol
                        </p>
                    </div>
                </div>
            );
        }

        return <WrappedComponent {...props} studentSession={session} onLogout={() => { clearStudentSession(); setSession(null); }} />;
    };
}

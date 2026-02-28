import { useState, useEffect, useRef } from "react";
import { newsApi } from "../../services/api";
import "./AdminPages.css";

const CATEGORIES = [
  { value: "all", label: "All", color: "#64748b" },
  { value: "general", label: "General", color: "#4f46e5" },
  { value: "academic", label: "Academic", color: "#10b981" },
  { value: "event", label: "Event", color: "#f59e0b" },
  { value: "important", label: "Important", color: "#ef4444" },
];

function getCategoryStyle(cat) {
  const found = CATEGORIES.find(c => c.value === cat);
  const color = found?.color || "#64748b";
  return { color, background: color + "1A", padding: "4px 12px", borderRadius: 8, fontWeight: 700, fontSize: 12 };
}

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterCat, setFilterCat] = useState("all");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "", description: "", category: "general",
    image_url: "", is_published: true, published_at: new Date().toISOString().split("T")[0],
  });

  useEffect(() => { fetchNews(); }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await newsApi.getAll();
      setNews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setFormData({ title: "", description: "", category: "general", image_url: "", is_published: true, published_at: new Date().toISOString().split("T")[0] });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormData({ title: item.title, description: item.description || "", category: item.category || "general", image_url: item.image_url || "", is_published: item.is_published, published_at: item.published_at || "" });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this news item?")) return;
    try {
      await newsApi.delete(id);
      setNews(news.filter(n => n.id !== id));
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const res = await newsApi.uploadImage(file);
      setFormData(f => ({ ...f, image_url: res.url }));
    } catch (err) {
      // If upload endpoint is not ready, use a local preview URL
      const localUrl = URL.createObjectURL(file);
      setFormData(f => ({ ...f, image_url: localUrl }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const updated = await newsApi.update(editing.id, formData);
        setNews(news.map(n => n.id === editing.id ? updated : n));
      } else {
        const created = await newsApi.create(formData);
        setNews([created, ...news]);
      }
      setShowForm(false);
    } catch (err) {
      alert(err.message || "Failed to save. Please try again.");
    }
  };

  const displayed = filterCat === "all" ? news : news.filter(n => n.category === filterCat);

  return (
    <div className="admin-page animate-in">
      {/* Header */}
      <div className="page-header">
        <div className="title-section">
          <h1>Announcements & News</h1>
          <p className="breadcrumb">Admin · Communication · News Board</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ New Announcement</button>
      </div>

      {/* Category Filter Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setFilterCat(cat.value)}
            style={{
              padding: "8px 20px", borderRadius: 20, border: "2px solid",
              borderColor: filterCat === cat.value ? cat.color : "#e2e8f0",
              background: filterCat === cat.value ? cat.color : "white",
              color: filterCat === cat.value ? "white" : "#64748b",
              fontWeight: 700, cursor: "pointer", fontSize: 13, transition: "all 0.2s",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* News Grid */}
      {loading ? (
        <div className="loading-container">Loading news...</div>
      ) : displayed.length === 0 ? (
        <div className="empty-state">No announcements found. Click "+ New Announcement" to add one.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
          {displayed.map(item => (
            <div key={item.id} className="news-card animate-in" style={{
              background: "white", borderRadius: 20, overflow: "hidden",
              border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              transition: "all 0.3s", display: "flex", flexDirection: "column"
            }}>
              {/* Image */}
              <div style={{ height: 180, overflow: "hidden", background: "#f8fafc", position: "relative" }}>
                {item.image_url ? (
                  <img
                    src={item.image_url} alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, color: "#e2e8f0" }}>
                    📰
                  </div>
                )}
                {/* Published badge */}
                <div style={{ position: "absolute", top: 12, right: 12 }}>
                  <span style={{
                    padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: item.is_published ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                    color: item.is_published ? "#10b981" : "#ef4444",
                    backdropFilter: "blur(4px)"
                  }}>
                    {item.is_published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: "20px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={getCategoryStyle(item.category)}>{item.category}</span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>
                    {item.published_at ? new Date(item.published_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : ""}
                  </span>
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, color: "#1e293b", lineHeight: 1.3 }}>
                  {item.title}
                </h3>
                {item.description && (
                  <p style={{ margin: 0, color: "#64748b", fontSize: 14, flex: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                    {item.description}
                  </p>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 16, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
                  <button className="action-btn edit" onClick={() => openEdit(item)} style={{ flex: 1, padding: "8px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                    ✏️ Edit
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(item.id)} style={{ flex: 1, padding: "8px", borderRadius: 10, border: "1px solid #fee2e2", background: "#fff5f5", cursor: "pointer", fontWeight: 600, fontSize: 13, color: "#ef4444" }}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== Modal Form ===== */}
      {showForm && (
        <div className="modal" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-content glass-effect animate-in" style={{ width: 560, maxHeight: "90vh", overflowY: "auto" }}>
            <div className="modal-header" style={{ marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
                {editing ? "✏️ Edit Announcement" : "📢 New Announcement"}
              </h3>
              <p style={{ color: "#64748b", margin: "5px 0 0", fontSize: 14 }}>
                Fill in the details below to {editing ? "update" : "publish"} the announcement.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  placeholder="e.g. Final Exam Schedule Fall 2025"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label>Category</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    {CATEGORIES.filter(c => c.value !== "all").map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Published Date</label>
                  <input
                    type="date"
                    value={formData.published_at}
                    onChange={e => setFormData({ ...formData, published_at: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={4}
                  placeholder="Write the full announcement text here..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ padding: "12px 14px", border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 14, fontFamily: "inherit", resize: "vertical", width: "100%", boxSizing: "border-box" }}
                />
              </div>

              {/* Image Upload */}
              <div className="form-group">
                <label>Cover Image</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: "2px dashed #e2e8f0", borderRadius: 14, padding: "20px",
                    textAlign: "center", cursor: "pointer", transition: "all 0.2s",
                    background: "#fafafa",
                  }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleImageUpload({ target: { files: e.dataTransfer.files } }); }}
                >
                  {formData.image_url ? (
                    <div>
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        style={{ maxHeight: 150, maxWidth: "100%", borderRadius: 10, objectFit: "cover" }}
                        onError={e => e.target.style.display = "none"}
                      />
                      <p style={{ color: "#4f46e5", margin: "8px 0 0", fontSize: 13, fontWeight: 600 }}>Click to change image</p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 32 }}>🖼️</div>
                      <p style={{ color: "#64748b", margin: "8px 0 0", fontSize: 14 }}>
                        {uploading ? "Uploading..." : "Click or drag & drop to upload an image"}
                      </p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />

                {/* OR paste URL */}
                <input
                  placeholder="Or paste image URL..."
                  value={formData.image_url}
                  onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                  style={{ marginTop: 10 }}
                />
              </div>

              {/* Published Toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "10px 0 24px", padding: "14px 18px", background: "#f8fafc", borderRadius: 12 }}>
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.is_published}
                  onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                  style={{ width: 18, height: 18, cursor: "pointer" }}
                />
                <label htmlFor="published" style={{ cursor: "pointer", fontWeight: 600, color: "#1e293b" }}>
                  Publish immediately
                  <span style={{ display: "block", fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>
                    Uncheck to save as draft (not visible to students)
                  </span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  {editing ? "💾 Save Changes" : "📢 Publish Announcement"}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

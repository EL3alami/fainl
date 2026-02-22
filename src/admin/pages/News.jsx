import { useState } from "react";
import "./AdminPages.css";

export default function News() {
  const [news, setNews] = useState([
    { 
      id: 1, 
      title: "First Graduating Class of FCI Arish", 
      date: "2025-08-07",
      image: "https://images.unsplash.com/photo-1556761175-4b46a572b786",
      description: ""
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    image: null,
    imagePreview: null,
    description: "",
  });

  const handleAdd = () => {
    setEditing(null);
    setFormData({ 
      title: "", 
      date: "", 
      image: null, 
      imagePreview: null,
      description: "" 
    });
    setShowForm(true);
  };

  const handleEdit = (n) => {
    setEditing(n);
    setFormData({
      ...n,
      image: null,
      imagePreview: n.image || null,
    });
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: file,
          imagePreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (id) => {
    setNews(news.filter((n) => n.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newsData = {
      ...formData,
      image: formData.imagePreview || formData.image,
    };

    if (editing) {
      setNews(
        news.map((n) =>
          n.id === editing.id ? { ...newsData, id: n.id } : n
        )
      );
    } else {
      setNews([...news, { ...newsData, id: Date.now() }]);
    }

    setShowForm(false);
  };

  return (
    <div className="admin-page">
      <h1>Manage News</h1>

      <button className="btn-add" onClick={handleAdd}>
        Add News
      </button>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Description</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {news.map((n) => (
            <tr key={n.id}>
              <td>
                {n.image && (
                  <img
                    src={n.image}
                    alt={n.title}
                    style={{
                      width: "80px",
                      height: "50px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                )}
              </td>
              <td>{n.title}</td>
              <td style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.description}</td>
              <td>{n.date}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(n)}>
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(n.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div className="modal">
          <form className="modal-content" onSubmit={handleSubmit}>
            <h3>{editing ? "Edit News" : "Add News"}</h3>

            <input
              placeholder="News Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />

            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />

            <div style={{ margin: "10px 0" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                News Image:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {formData.imagePreview && (
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: "200px",
                    objectFit: "contain",
                    marginTop: "10px",
                    borderRadius: "4px",
                  }}
                />
              )}
            </div>

            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows="4"
              style={{
                width: "100%",
                padding: "10px 12px",
                margin: "8px 0",
                border: "2px solid #e0e0e0",
                borderRadius: "6px",
                fontSize: "14px",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
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

export default function AdminModal({ title, onClose, onSave, children }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>{title}</h3>

        <div className="modal-content">{children}</div>

        <div className="modal-actions">
          <button className="btn-delete" onClick={onClose}>Cancel</button>
          <button className="btn-add" onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

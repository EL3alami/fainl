import React from 'react';
import './NewsModal.css';

export default function NewsModal({ open, onClose, item }) {
  if (!open || !item) return null;

  return (
    <div className="news-modal-overlay" onClick={onClose}>
      <div className="news-modal" onClick={(e) => e.stopPropagation()}>
        <button className="news-modal-close" onClick={onClose}>✕</button>
        {item.image_url && <img src={item.image_url} alt={item.title} className="news-modal-img" />}
        <h2 className="news-modal-title">{item.title}</h2>
        <span className="news-modal-date">{item.published_at ? new Date(item.published_at).toLocaleDateString() : ''}</span>
        <div className="news-modal-body" style={{ whiteSpace: 'pre-wrap' }}>{item.description}</div>
      </div>
    </div>
  );
}

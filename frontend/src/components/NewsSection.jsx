import React, { useState, useEffect } from 'react';
import NewsModal from './NewsModal';
import { newsApi } from '../services/api';

export default function NewsSection() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // Fetch only published news
        const data = await newsApi.getAll('published=1');
        setNews(data);
      } catch (err) {
        console.error('Failed to fetch news:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) return <div className="news-loading">Loading news...</div>;

  return (
    <>
      <div className="news-grid">
        {news.length === 0 && !loading && (
          <div className="no-news-placeholder">
            <p>Stay tuned! Official announcements will appear here soon.</p>
          </div>
        )}
        {news.map((n) => (
          <div className="news-card animate-in-up" key={n.id}>
            <div
              className="news-img-container"
              style={{
                position: 'relative',
                '--bg-img': n.image_url ? `url(${n.image_url.startsWith('http') ? n.image_url : `http://localhost:8000${n.image_url}`})` : 'none'
              }}
            >
              {n.image_url ? (
                <img src={n.image_url.startsWith('http') ? n.image_url : `http://localhost:8000${n.image_url}`} className="news-img" alt={n.title} />
              ) : (
                <div className="news-img-placeholder">📰</div>
              )}
              <span className={`news-cat-tag ${n.category}`}>{n.category}</span>
            </div>
            <div className="news-content-box">
              <span className="date">📅 {n.published_at ? new Date(n.published_at).toLocaleDateString("en-GB") : ''}</span>
              <h3 title={n.title}>{n.title}</h3>
              <p>{n.description ? n.description.substring(0, 90) + '...' : 'No description provided.'}</p>
              <button className="news-btn-modern" onClick={() => setSelected(n)}>
                <span>Read Details</span>
                <i className="arrow-right">→</i>
              </button>
            </div>
          </div>
        ))}
      </div>

      <NewsModal open={!!selected} onClose={() => setSelected(null)} item={selected} />
    </>
  );
}

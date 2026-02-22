import React, { useState } from 'react';
import NewsModal from './NewsModal';

const NEWS = [
  {
    id: 1,
    title: 'First Graduating Class of FCI Arish',
    date: 'August 7, 2025',
    img: 'https://images.unsplash.com/photo-1556761175-4b46a572b786',
    body: (
      <>
        <p>
          Arish University celebrated the graduation of the first class of the
          Faculty of Computers and Information. The ceremony highlighted student
          achievements, research showcases, and keynote speeches from faculty members.
        </p>
        <p>
          Graduates were commended for their academic excellence and community contributions.
        </p>
      </>
    ),
  },
  {
    id: 2,
    title: 'Regional Conference – Tamkeen Initiative',
    date: 'October 29, 2025',
    img: 'https://images.weserv.nl/?url=images.unsplash.com/photo-1581092160624-7f7c39c17c37',
    body: (
      <>
        <p>
          A regional awareness conference within the presidential “Tamkeen” Initiative gathered
          academics and industry leaders to discuss digital inclusion and local capacity building.
        </p>
        <p>
          The event included workshops, panel discussions, and calls for collaboration between universities.
        </p>
      </>
    ),
  },
  {
    id: 3,
    title: 'Admission Opportunities in CS & AI',
    date: 'August 6, 2025',
    img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0',
    body: (
      <>
        <p>
          New admission openings for Computer Science and AI programs. Prospective students are invited
          to attend open days, meet faculty, and apply through the university portal.
        </p>
        <p>
          Scholarships and preparatory courses are available for eligible candidates.
        </p>
      </>
    ),
  },
];

export default function NewsSection() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <div className="news-grid">
        {NEWS.map((n) => (
          <div className="news-card" key={n.id}>
            <img src={n.img} className="news-img" alt={n.title} />
            <h3>{n.title}</h3>
            <span className="date">{n.date}</span>
            <p>{typeof n.body === 'string' ? n.body : (n.body.props.children[0] || '')}</p>
            <button className="news-btn" onClick={() => setSelected(n)}>Read More</button>
          </div>
        ))}
      </div>

      <NewsModal open={!!selected} onClose={() => setSelected(null)} item={selected} />
    </>
  );
}

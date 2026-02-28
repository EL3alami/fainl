import { useState, useEffect } from "react";
import "./Highlights.css";

export default function DashboardHighlights() {
  const highlights = [
    {
      icon: "🛡️",
      title: "SIS Admin Suite",
      desc: "Full administrative control over faculty records, department structures, and system configurations with advanced management tools.",
      color: "#4f46e5"
    },
    {
      icon: "🎓",
      title: "Student Success Portal",
      desc: "Empowering students with seamless course registration, real-time grade tracking, and automated GPA performance analytics.",
      color: "#10b981"
    },
    {
      icon: "👨‍🏫",
      title: "Faculty Dashboard",
      desc: "Dedicated supervisor tools for professors to manage course materials, monitor student progress, and oversee department activities.",
      color: "#f59e0b"
    },
    {
      icon: "🔄",
      title: "Unified SIS Ecosystem",
      desc: "A singular, high-performance platform connecting administration, faculty, and students for a frictionless academic experience.",
      color: "#ef4444"
    }
  ];

  return (
    <section className="highlights-section">
      <div className="highlights-container">
        {highlights.map((item, idx) => (
          <div key={idx} className="highlight-card animate-in" style={{ "--card-color": item.color }}>
            <div className="card-top-accent"></div>
            <div className="icon-wrapper">
              <span className="icon-emoji">{item.icon}</span>
              <div className="icon-glow"></div>
            </div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
            <div className="card-footer-blur"></div>
          </div>
        ))}
      </div>
    </section>
  );
}

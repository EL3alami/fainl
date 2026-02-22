import { Routes, Route } from "react-router-dom";

/* ====== Website Components ====== */
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Highlights from "./components/Highlights";
import Academic from "./components/Academic";
import Footer from "./components/Footer";

/* ====== Admin Components ====== */
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import Students from "./admin/pages/Students";
import Professors from "./admin/pages/Professors";
import Departments from "./admin/pages/Departments";
import Courses from "./admin/pages/Courses";
import Grades from "./admin/pages/Grades";
import CourseRegistration from "./admin/pages/CourseRegistration";
import News from "./admin/pages/News";
import Schedules from "./admin/pages/Schedules";
import Settings from "./admin/pages/Settings";

/* ====== Student Components ====== */
import StudentLayout from "./student/StudentLayout";
import StudentDashboard from "./student/pages/StudentDashboard";
import StudentCourseRegistration from "./student/pages/CourseRegistration";
import MyGrades from "./student/pages/MyGrades";
import ClassSchedule from "./student/pages/ClassSchedule";

/* ====== Professor Components ====== */
import ProfessorLayout from "./professor/ProfessorLayout";
import ProfessorDashboard from "./professor/pages/ProfessorDashboard";
import MyCourses from "./professor/pages/MyCourses";
import MySchedule from "./professor/pages/MySchedule";
import SupervisorPanel from "./professor/pages/SupervisorPanel";
import DepartmentStudents from "./professor/pages/DepartmentStudents";

/* ====== Auth Components ====== */
import Login from "./auth/Login";
import NewsSection from "./components/NewsSection";

import "./index.css";

/* ====== Website Home Page ====== */
function WebsiteHome() {
  const sectionStyle = {
    paddingTop: "50px",
    minHeight: "50vh",
  };

  return (
    <>
      <Navbar />

      <section id="home" style={sectionStyle}>
        <Hero />
      </section>

      <section id="about" style={sectionStyle}>
        <About />
      </section>

      <section id="departments" style={sectionStyle}>
        <Highlights />
      </section>

      <section id="programs" style={sectionStyle}>
        <Academic />
      </section>

      <section id="news" style={sectionStyle}>
        <h2 style={{ marginBottom: "10px" }}>What’s New?</h2>
        <p style={{ marginBottom: "30px", color: "gray" }}>
          Discover recent highlights, important notices, and faculty achievements.
        </p>

        <NewsSection />
      </section>

      <Footer />
    </>
  );
}

/* ====== App Routes ====== */
function App() {
  return (
    <Routes>
      {/* Website */}
      <Route path="/" element={<WebsiteHome />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:level" element={<Students />} />
        <Route path="professors" element={<Professors />} />
        <Route path="departments" element={<Departments />} />
        <Route path="courses" element={<Courses />} />
        <Route path="grades" element={<Grades />} />
        <Route path="course-registration" element={<CourseRegistration />} />
        <Route path="news" element={<News />} />
        <Route path="schedules" element={<Schedules />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Student */}
      <Route path="/student" element={<StudentLayout />}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="courses" element={<StudentCourseRegistration />} />
        <Route path="grades" element={<MyGrades />} />
        <Route path="schedule" element={<ClassSchedule />} />
      </Route>

      {/* Professor */}
      <Route path="/professor" element={<ProfessorLayout />}>
        <Route path="dashboard" element={<ProfessorDashboard />} />
        <Route path="courses" element={<MyCourses />} />
        <Route path="schedule" element={<MySchedule />} />
        <Route path="supervisor" element={<SupervisorPanel />} />
        <Route path="department-students" element={<DepartmentStudents />} />
      </Route>

      {/* Auth */}
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;




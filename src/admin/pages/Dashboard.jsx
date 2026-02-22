import StatCard from "../components/StatCard";

export default function Dashboard() {
  // داتا جاهزة للربط بالباك اند
  const stats = {
    students: 2,
    professors: 1,
    departments: 2,
    courses: 1,
  };

  return (
    <>
      <h1 className="page-title">Dashboard Overview</h1>

      <div className="stats-grid">
        <StatCard title="Students" value={stats.students} />
        <StatCard title="Professors" value={stats.professors} />
        <StatCard title="Departments" value={stats.departments} />
        <StatCard title="Courses" value={stats.courses} />
      </div>
    </>
  );
}

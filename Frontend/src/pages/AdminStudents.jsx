import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";

function AdminStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    loadStudents();
  }, [navigate]);

  const loadStudents = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:5000/api/admin/students"
      );

      setStudents(response.data);
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to load students"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const searchText = search.toLowerCase();

    return (
      student.name?.toLowerCase().includes(searchText) ||
      student.email?.toLowerCase().includes(searchText)
    );
  });

  const totalStudents = students.length;

  const activeBorrowers = students.filter(
    (student) => Number(student.borrowed_count) > 0
  ).length;

  const studentsWithFines = students.filter(
    (student) => Number(student.unpaid_fines) > 0
  ).length;

  return (
    <>
      <AdminNavbar />

      <main className="admin-students-page">
        <div className="admin-students-container">

          {/* Header */}
          <section className="admin-students-header">
            <div>
              <span className="admin-students-eyebrow">
                ADMINISTRATION
              </span>

              <h1>Student Management</h1>

              <p>
                View registered students and monitor their
                library activity.
              </p>
            </div>
          </section>

          {/* Overview */}
          <section className="admin-students-overview">

            <div className="admin-students-stat-card">
              <div className="admin-students-stat-icon">
                👥
              </div>

              <div>
                <span>Total Students</span>
                <strong>{totalStudents}</strong>
                <small>Registered members</small>
              </div>
            </div>

            <div className="admin-students-stat-card">
              <div className="admin-students-stat-icon borrowed">
                📚
              </div>

              <div>
                <span>Active Borrowers</span>
                <strong>{activeBorrowers}</strong>
                <small>Currently borrowing</small>
              </div>
            </div>

            <div className="admin-students-stat-card">
              <div className="admin-students-stat-icon fine">
                ₹
              </div>

              <div>
                <span>Students With Fines</span>
                <strong>{studentsWithFines}</strong>
                <small>Unpaid fine balance</small>
              </div>
            </div>

          </section>

          {/* Search */}
          <section className="admin-students-toolbar">

            <div className="admin-students-search">

              <span className="admin-students-search-icon">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search by student name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button
                  className="admin-students-clear"
                  onClick={() => setSearch("")}
                >
                  ×
                </button>
              )}

            </div>

            <div className="admin-students-result-count">
              <strong>{filteredStudents.length}</strong>

              <span>
                {filteredStudents.length === 1
                  ? "student"
                  : "students"}{" "}
                shown
              </span>
            </div>

          </section>

          {/* Loading */}
          {loading ? (
            <div className="admin-students-state">

              <div className="admin-students-state-icon">
                👥
              </div>

              <h3>Loading students...</h3>

              <p>
                Please wait while student records are loaded.
              </p>

            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="admin-students-state">

              <div className="admin-students-state-icon">
                {search ? "⌕" : "👥"}
              </div>

              <h3>
                {search
                  ? "No students found"
                  : "No students registered"}
              </h3>

              <p>
                {search
                  ? "Try searching with a different name or email."
                  : "Student accounts will appear here once they register."}
              </p>

              {search && (
                <button
                  className="admin-students-empty-btn"
                  onClick={() => setSearch("")}
                >
                  Clear Search
                </button>
              )}

            </div>
          ) : (
            <section className="admin-students-table-card">

              {/* Table Header */}
              <div className="admin-students-table-heading">

                <div>
                  <span>REGISTERED MEMBERS</span>
                  <h2>All Students</h2>
                </div>

                <div className="admin-students-table-total">
                  {filteredStudents.length}{" "}
                  {filteredStudents.length === 1
                    ? "student"
                    : "students"}
                </div>

              </div>

              {/* Desktop Columns */}
              <div className="admin-students-columns">
                <span>ID</span>
                <span>STUDENT</span>
                <span>EMAIL</span>
                <span>BORROWED</span>
                <span>RESERVATIONS</span>
                <span>FINE</span>
              </div>

              {/* Student Rows */}
              <div className="admin-students-list">

                {filteredStudents.map((student) => {

                  const borrowed =
                    Number(student.borrowed_count || 0);

                  const reservations =
                    Number(student.reservation_count || 0);

                  const fine =
                    Number(student.unpaid_fines || 0);

                  return (
                    <div
                      className="admin-students-row"
                      key={student.user_id}
                    >

                      {/* ID */}
                      <div className="admin-students-id">
                        #{student.user_id}
                      </div>

                      {/* Student */}
                      <div className="admin-students-person">

                        <div className="admin-students-avatar">
                          {student.name
                            ?.charAt(0)
                            ?.toUpperCase() || "S"}
                        </div>

                        <div>
                          <h3>{student.name}</h3>
                          <span>Student Member</span>
                        </div>

                      </div>

                      {/* Email */}
                      <div className="admin-students-email">
                        {student.email}
                      </div>

                      {/* Borrowed */}
                      <div className="admin-students-metric">

                        <strong
                          className={
                            borrowed > 0
                              ? "active"
                              : ""
                          }
                        >
                          {borrowed}
                        </strong>

                        <span>
                          {borrowed === 1
                            ? "book"
                            : "books"}
                        </span>

                      </div>

                      {/* Reservations */}
                      <div className="admin-students-metric">

                        <strong
                          className={
                            reservations > 0
                              ? "active"
                              : ""
                          }
                        >
                          {reservations}
                        </strong>

                        <span>
                          {reservations === 1
                            ? "active"
                            : "active"}
                        </span>

                      </div>

                      {/* Fine */}
                      <div className="admin-students-fine">

                        {fine > 0 ? (
                          <>
                            <strong>
                              ₹{fine.toFixed(2)}
                            </strong>

                            <span>Unpaid</span>
                          </>
                        ) : (
                          <>
                            <strong className="clear">
                              ✓
                            </strong>

                            <span className="clear">
                              No Fine
                            </span>
                          </>
                        )}

                      </div>

                    </div>
                  );
                })}

              </div>

              {/* Footer */}
              <div className="admin-students-table-footer">

                Showing{" "}
                <strong>
                  {filteredStudents.length}
                </strong>{" "}
                of{" "}
                <strong>{students.length}</strong>{" "}
                students

              </div>

            </section>
          )}

        </div>
      </main>
    </>
  );
}

export default AdminStudents;
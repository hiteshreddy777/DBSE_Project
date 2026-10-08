import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:5000/api/admin/dashboard-stats"
      );

      setStats(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch dashboard statistics:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />

        <main className="admin-dashboard-page">
          <div className="admin-dashboard-container">
            <div className="admin-dashboard-loading">
              <div className="admin-dashboard-loading-icon">
                📊
              </div>

              <h2>Loading dashboard...</h2>

              <p>
                Retrieving the latest library statistics.
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!stats) {
    return (
      <>
        <AdminNavbar />

        <main className="admin-dashboard-page">
          <div className="admin-dashboard-container">
            <div className="admin-dashboard-error">
              <div className="admin-dashboard-error-icon">
                ⚠️
              </div>

              <h2>Unable to load dashboard</h2>

              <p>
                Something went wrong while retrieving the
                library statistics.
              </p>

              <button
                className="admin-dashboard-retry"
                onClick={fetchStats}
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />

      <main className="admin-dashboard-page">
        <div className="admin-dashboard-container">

          {/* HEADER */}

          <section className="admin-dashboard-header">

            <div>
              <span className="admin-dashboard-eyebrow">
                ADMINISTRATION
              </span>

              <h1>Library Dashboard</h1>

              <p>
                Monitor and manage the complete library
                system from one place.
              </p>
            </div>

            <button
              className="admin-dashboard-refresh"
              onClick={fetchStats}
            >
              <span>↻</span>
              Refresh Data
            </button>

          </section>


          {/* OVERVIEW */}

          <section className="admin-dashboard-overview">

            <div className="admin-dashboard-section-title">
              <div>
                <span>LIBRARY OVERVIEW</span>
                <h2>System Statistics</h2>
              </div>

              <p>
                Current library activity
              </p>
            </div>


            <div className="admin-dashboard-stats">

              <div className="admin-dashboard-stat-card">

                <div className="admin-dashboard-stat-top">
                  <div className="admin-dashboard-stat-icon">
                    📚
                  </div>

                  <span className="admin-dashboard-stat-tag">
                    COLLECTION
                  </span>
                </div>

                <strong>
                  {stats.total_books}
                </strong>

                <span>
                  Total Books
                </span>

              </div>


              <div className="admin-dashboard-stat-card">

                <div className="admin-dashboard-stat-top">
                  <div className="admin-dashboard-stat-icon">
                    👩‍🎓
                  </div>

                  <span className="admin-dashboard-stat-tag">
                    USERS
                  </span>
                </div>

                <strong>
                  {stats.total_students}
                </strong>

                <span>
                  Registered Students
                </span>

              </div>


              <div className="admin-dashboard-stat-card">

                <div className="admin-dashboard-stat-top">
                  <div className="admin-dashboard-stat-icon">
                    📖
                  </div>

                  <span className="admin-dashboard-stat-tag">
                    ACTIVE
                  </span>
                </div>

                <strong>
                  {stats.currently_borrowed}
                </strong>

                <span>
                  Currently Borrowed
                </span>

              </div>


              <div className="admin-dashboard-stat-card">

                <div className="admin-dashboard-stat-top">
                  <div className="admin-dashboard-stat-icon warning">
                    ⏰
                  </div>

                  <span className="admin-dashboard-stat-tag warning">
                    ATTENTION
                  </span>
                </div>

                <strong>
                  {stats.overdue_books}
                </strong>

                <span>
                  Overdue Books
                </span>

              </div>


              <div className="admin-dashboard-stat-card">

                <div className="admin-dashboard-stat-top">
                  <div className="admin-dashboard-stat-icon">
                    📌
                  </div>

                  <span className="admin-dashboard-stat-tag">
                    ACTIVE
                  </span>
                </div>

                <strong>
                  {stats.active_reservations}
                </strong>

                <span>
                  Active Reservations
                </span>

              </div>


              <div className="admin-dashboard-stat-card">

                <div className="admin-dashboard-stat-top">
                  <div className="admin-dashboard-stat-icon fine">
                    ₹
                  </div>

                  <span className="admin-dashboard-stat-tag fine">
                    UNPAID
                  </span>
                </div>

                <strong className="admin-dashboard-fine-number">
                  ₹{Number(stats.unpaid_fines).toFixed(2)}
                </strong>

                <span>
                  Unpaid Fines
                </span>

              </div>

            </div>

          </section>


          {/* ADMINISTRATION */}

          <section className="admin-dashboard-management">

            <div className="admin-dashboard-section-title">
              <div>
                <span>MANAGEMENT TOOLS</span>

                <h2>
                  Administration
                </h2>
              </div>

              <p>
                Manage different areas of SmartLibrary
              </p>
            </div>


            <div className="admin-dashboard-actions">

              <button
                className="admin-dashboard-action-card"
                onClick={() => navigate("/admin/books")}
              >
                <div className="admin-dashboard-action-icon">
                  📚
                </div>

                <div className="admin-dashboard-action-content">
                  <h3>
                    Book Management
                  </h3>

                  <p>
                    Add, edit, search and manage library
                    books.
                  </p>
                </div>

                <span className="admin-dashboard-action-arrow">
                  →
                </span>
              </button>


              <button
                className="admin-dashboard-action-card"
                onClick={() => navigate("/admin/students")}
              >
                <div className="admin-dashboard-action-icon">
                  👩‍🎓
                </div>

                <div className="admin-dashboard-action-content">
                  <h3>
                    Student Management
                  </h3>

                  <p>
                    View registered students and their
                    library activity.
                  </p>
                </div>

                <span className="admin-dashboard-action-arrow">
                  →
                </span>
              </button>


              <button
                className="admin-dashboard-action-card"
                onClick={() => navigate("/admin/borrowing")}
              >
                <div className="admin-dashboard-action-icon">
                  📖
                </div>

                <div className="admin-dashboard-action-content">
                  <h3>
                    Borrowing Records
                  </h3>

                  <p>
                    Track borrowed, returned and overdue
                    books.
                  </p>
                </div>

                <span className="admin-dashboard-action-arrow">
                  →
                </span>
              </button>


              <button
                className="admin-dashboard-action-card"
                onClick={() => navigate("/admin/reservations")}
              >
                <div className="admin-dashboard-action-icon">
                  📌
                </div>

                <div className="admin-dashboard-action-content">
                  <h3>
                    Reservations
                  </h3>

                  <p>
                    Monitor active and completed
                    reservations.
                  </p>
                </div>

                <span className="admin-dashboard-action-arrow">
                  →
                </span>
              </button>


              <button
                className="admin-dashboard-action-card"
                onClick={() => navigate("/admin/fines")}
              >
                <div className="admin-dashboard-action-icon">
                  💰
                </div>

                <div className="admin-dashboard-action-content">
                  <h3>
                    Fine Management
                  </h3>

                  <p>
                    View and manage outstanding library
                    fines.
                  </p>
                </div>

                <span className="admin-dashboard-action-arrow">
                  →
                </span>
              </button>


              <button
                className="admin-dashboard-action-card"
                onClick={() => navigate("/admin/reports")}
              >
                <div className="admin-dashboard-action-icon">
                  📊
                </div>

                <div className="admin-dashboard-action-content">
                  <h3>
                    Reports & Analytics
                  </h3>

                  <p>
                    View library statistics and activity
                    reports.
                  </p>
                </div>

                <span className="admin-dashboard-action-arrow">
                  →
                </span>
              </button>

            </div>

          </section>

        </div>
      </main>
    </>
  );
}

export default AdminDashboard;
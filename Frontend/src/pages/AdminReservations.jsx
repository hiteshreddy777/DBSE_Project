import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";

function AdminReservations() {
  const navigate = useNavigate();

  const [reservations, setReservations] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

    loadReservations();
  }, [navigate]);

  const loadReservations = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:5000/api/admin/reservations"
      );

      setReservations(response.data);
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to load reservations"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredReservations = reservations.filter(
    (reservation) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        reservation.student_name
          ?.toLowerCase()
          .includes(searchText) ||
        reservation.student_email
          ?.toLowerCase()
          .includes(searchText) ||
        reservation.book_title
          ?.toLowerCase()
          .includes(searchText) ||
        reservation.book_author
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        reservation.status === statusFilter;

      return matchesSearch && matchesStatus;
    }
  );

  const activeCount = reservations.filter(
    (reservation) =>
      reservation.status === "active"
  ).length;

  const cancelledCount = reservations.filter(
    (reservation) =>
      reservation.status === "cancelled"
  ).length;

  const completedCount = reservations.filter(
    (reservation) =>
      reservation.status === "completed"
  ).length;

  const getStatusClass = (status) => {
    if (status === "active") {
      return "admin-reservations-status active";
    }

    if (status === "cancelled") {
      return "admin-reservations-status cancelled";
    }

    return "admin-reservations-status completed";
  };

  return (
    <>
      <AdminNavbar />

      <main className="admin-reservations-page">
        <div className="admin-reservations-container">

          {/* Header */}
          <section className="admin-reservations-header">

            <div>
              <span className="admin-reservations-eyebrow">
                ADMINISTRATION
              </span>

              <h1>Reservation Management</h1>

              <p>
                Monitor book reservations made by students
                across the library.
              </p>
            </div>

            <button
              className="admin-reservations-refresh"
              onClick={loadReservations}
              disabled={loading}
            >
              ↻ Refresh
            </button>

          </section>

          {/* Overview */}
          <section className="admin-reservations-overview">

            <div className="admin-reservations-stat-card">

              <div className="admin-reservations-stat-icon">
                🔖
              </div>

              <div>
                <span>Total Reservations</span>
                <strong>{reservations.length}</strong>
                <small>All reservation activity</small>
              </div>

            </div>

            <div className="admin-reservations-stat-card">

              <div className="admin-reservations-stat-icon active">
                ⏳
              </div>

              <div>
                <span>Active</span>
                <strong>{activeCount}</strong>
                <small>Currently active</small>
              </div>

            </div>

            <div className="admin-reservations-stat-card">

              <div className="admin-reservations-stat-icon completed">
                ✓
              </div>

              <div>
                <span>Completed</span>
                <strong>{completedCount}</strong>
                <small>Fulfilled reservations</small>
              </div>

            </div>

            <div className="admin-reservations-stat-card">

              <div className="admin-reservations-stat-icon cancelled">
                ×
              </div>

              <div>
                <span>Cancelled</span>
                <strong>{cancelledCount}</strong>
                <small>Cancelled reservations</small>
              </div>

            </div>

          </section>

          {/* Filters */}
          <section className="admin-reservations-toolbar">

            <div className="admin-reservations-search">

              <span className="admin-reservations-search-icon">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search student or book..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              {search && (
                <button
                  className="admin-reservations-clear"
                  onClick={() => setSearch("")}
                >
                  ×
                </button>
              )}

            </div>

            <div className="admin-reservations-filter">

              <label>Status</label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="all">
                  All Status
                </option>

                <option value="active">
                  Active
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>

            </div>

            <div className="admin-reservations-result-count">

              <strong>
                {filteredReservations.length}
              </strong>

              <span>
                {filteredReservations.length === 1
                  ? "reservation"
                  : "reservations"}{" "}
                shown
              </span>

            </div>

          </section>

          {/* Loading */}
          {loading ? (

            <div className="admin-reservations-state">

              <div className="admin-reservations-state-icon">
                🔖
              </div>

              <h3>Loading reservations...</h3>

              <p>
                Please wait while reservation records are
                being loaded.
              </p>

            </div>

          ) : filteredReservations.length === 0 ? (

            <div className="admin-reservations-state">

              <div className="admin-reservations-state-icon">
                {search || statusFilter !== "all"
                  ? "⌕"
                  : "🔖"}
              </div>

              <h3>
                {search || statusFilter !== "all"
                  ? "No matching reservations"
                  : "No reservations found"}
              </h3>

              <p>
                {search || statusFilter !== "all"
                  ? "Try changing your search or status filter."
                  : "Student reservations will appear here when books are reserved."}
              </p>

              {(search || statusFilter !== "all") && (
                <button
                  className="admin-reservations-clear-btn"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </button>
              )}

            </div>

          ) : (

            <section className="admin-reservations-table-card">

              {/* Table heading */}
              <div className="admin-reservations-table-heading">

                <div>
                  <span>LIBRARY ACTIVITY</span>

                  <h2>All Reservations</h2>
                </div>

                <div className="admin-reservations-table-total">
                  {filteredReservations.length}{" "}
                  {filteredReservations.length === 1
                    ? "reservation"
                    : "reservations"}
                </div>

              </div>

              {/* Columns */}
              <div className="admin-reservations-columns">

                <span>ID</span>
                <span>STUDENT</span>
                <span>BOOK</span>
                <span>RESERVED ON</span>
                <span>AVAILABLE</span>
                <span>STATUS</span>

              </div>

              {/* Rows */}
              <div className="admin-reservations-list">

                {filteredReservations.map(
                  (reservation) => {

                    const available =
                      Number(
                        reservation.available_quantity || 0
                      );

                    return (
                      <div
                        className="admin-reservations-row"
                        key={reservation.reservation_id}
                      >

                        {/* ID */}
                        <div className="admin-reservations-id">
                          #{reservation.reservation_id}
                        </div>

                        {/* Student */}
                        <div className="admin-reservations-student">

                          <div className="admin-reservations-avatar">
                            {reservation.student_name
                              ?.charAt(0)
                              ?.toUpperCase() || "S"}
                          </div>

                          <div>
                            <h3>
                              {reservation.student_name}
                            </h3>

                            <span>
                              {reservation.student_email}
                            </span>
                          </div>

                        </div>

                        {/* Book */}
                        <div className="admin-reservations-book">

                          <div className="admin-reservations-book-icon">
                            📖
                          </div>

                          <div>
                            <h3>
                              {reservation.book_title}
                            </h3>

                            <span>
                              {reservation.book_author}
                            </span>
                          </div>

                        </div>

                        {/* Date */}
                        <div className="admin-reservations-date">

                          {reservation.reservation_date
                            ? new Date(
                                reservation.reservation_date
                              ).toLocaleDateString()
                            : "—"}

                        </div>

                        {/* Availability */}
                        <div className="admin-reservations-availability">

                          <strong
                            className={
                              available > 0
                                ? "available"
                                : "unavailable"
                            }
                          >
                            {available}
                          </strong>

                          <span>
                            {available === 1
                              ? "copy"
                              : "copies"}
                          </span>

                        </div>

                        {/* Status */}
                        <div>
                          <span
                            className={getStatusClass(
                              reservation.status
                            )}
                          >
                            <span></span>
                            {reservation.status}
                          </span>
                        </div>

                      </div>
                    );
                  }
                )}

              </div>

              {/* Footer */}
              <div className="admin-reservations-table-footer">

                Showing{" "}
                <strong>
                  {filteredReservations.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {reservations.length}
                </strong>{" "}
                reservations

              </div>

            </section>

          )}

        </div>
      </main>
    </>
  );
}

export default AdminReservations;
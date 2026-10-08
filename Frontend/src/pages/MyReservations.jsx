import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    loadReservations();
  }, []);

  const loadReservations = () => {
    axios
      .get(
        `http://localhost:5000/api/my-reservations/${user.user_id}`
      )
      .then((response) => {
        setReservations(response.data);
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to load reservations");
        setLoading(false);
      });
  };

  const handleCancel = async (reservationId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this reservation?"
    );

    if (!confirmCancel) {
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/reservations/${reservationId}/cancel`,
        {
          user_id: user.user_id
        }
      );

      alert(response.data.message);

      loadReservations();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to cancel reservation"
      );
    }
  };

  const activeReservations = reservations.filter(
    (reservation) => reservation.status === "active"
  );

  const cancelledReservations = reservations.filter(
    (reservation) => reservation.status === "cancelled"
  );

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="my-reservations-page">
          <div className="my-reservations-container">
            <div className="my-reservations-loading">
              <div className="my-reservations-loading-icon">
                🔖
              </div>

              <h2>Loading your reservations...</h2>

              <p>
                Please wait while we retrieve your reservation
                information.
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="my-reservations-page">
        <div className="my-reservations-container">

          {/* HEADER */}

          <section className="my-reservations-header">
            <div>
              <span className="my-reservations-eyebrow">
                MY LIBRARY
              </span>

              <h1>Reservations</h1>

              <p>
                Keep track of books you've reserved and
                manage your active reservations.
              </p>
            </div>

            <button
              className="my-reservations-find-btn"
              onClick={() => navigate("/books")}
            >
              <span>+</span>
              Find a Book
            </button>
          </section>


          {/* OVERVIEW */}

          <section className="my-reservations-overview">

            <div className="my-reservations-stat-card">
              <div className="my-reservations-stat-icon">
                🔖
              </div>

              <div>
                <span className="my-reservations-stat-label">
                  Active Reservations
                </span>

                <strong className="my-reservations-stat-number">
                  {activeReservations.length}
                </strong>

                <p>Currently active</p>
              </div>
            </div>


            <div className="my-reservations-stat-card">
              <div className="my-reservations-stat-icon history">
                ✓
              </div>

              <div>
                <span className="my-reservations-stat-label">
                  Reservation History
                </span>

                <strong className="my-reservations-stat-number">
                  {cancelledReservations.length}
                </strong>

                <p>Cancelled reservations</p>
              </div>
            </div>

          </section>


          {/* ACTIVE RESERVATIONS */}

          <section className="my-reservations-section">

            <div className="my-reservations-section-heading">

              <div>
                <span className="my-reservations-section-label">
                  CURRENT RESERVATIONS
                </span>

                <h2>Active Reservations</h2>

                <p>
                  Books currently on your reservation list.
                </p>
              </div>

              {activeReservations.length > 0 && (
                <span className="my-reservations-count">
                  {activeReservations.length}{" "}
                  {activeReservations.length === 1
                    ? "reservation"
                    : "reservations"}
                </span>
              )}

            </div>


            {activeReservations.length > 0 ? (

              <div className="my-reservations-list">

                {activeReservations.map((reservation) => (

                  <article
                    className="my-reservations-card"
                    key={reservation.reservation_id}
                  >

                    <div className="my-reservations-card-main">

                      <div className="my-reservations-cover">
                        🔖
                      </div>


                      <div className="my-reservations-details">

                        <div className="my-reservations-title-row">

                          <div>
                            <h3>
                              {reservation.title}
                            </h3>

                            <p>
                              by {reservation.author}
                            </p>
                          </div>

                          <span className="my-reservations-status active">
                            ACTIVE
                          </span>

                        </div>


                        <div className="my-reservations-meta">

                          <div>
                            <span>Reserved</span>

                            <strong>
                              {new Date(
                                reservation.reservation_date
                              ).toLocaleDateString()}
                            </strong>
                          </div>

                          <div>
                            <span>Reference</span>

                            <strong>
                              #{reservation.reservation_id}
                            </strong>
                          </div>

                          <div>
                            <span>Availability</span>

                            <strong>
                              {reservation.available_quantity}{" "}
                              {reservation.available_quantity === 1
                                ? "copy"
                                : "copies"}
                            </strong>
                          </div>

                        </div>

                      </div>

                    </div>


                    <div className="my-reservations-action">

                      <button
                        className="my-reservations-cancel-btn"
                        onClick={() =>
                          handleCancel(
                            reservation.reservation_id
                          )
                        }
                      >
                        Cancel Reservation
                      </button>

                    </div>

                  </article>

                ))}

              </div>

            ) : (

              <div className="my-reservations-empty">

                <div className="my-reservations-empty-icon">
                  🔖
                </div>

                <h3>No active reservations</h3>

                <p>
                  You don't currently have any active book
                  reservations.
                </p>

                <button
                  className="my-reservations-explore-btn"
                  onClick={() => navigate("/books")}
                >
                  Explore Books →
                </button>

              </div>

            )}

          </section>


          {/* RESERVATION HISTORY */}

          {cancelledReservations.length > 0 && (

            <section className="my-reservations-section history-section">

              <div className="my-reservations-section-heading">

                <div>
                  <span className="my-reservations-section-label">
                    HISTORY
                  </span>

                  <h2>Reservation History</h2>

                  <p>
                    Reservations you've previously cancelled.
                  </p>
                </div>

                <span className="my-reservations-count">
                  {cancelledReservations.length}{" "}
                  {cancelledReservations.length === 1
                    ? "reservation"
                    : "reservations"}
                </span>

              </div>


              <div className="my-reservations-list">

                {cancelledReservations.map((reservation) => (

                  <article
                    className="my-reservations-card cancelled"
                    key={reservation.reservation_id}
                  >

                    <div className="my-reservations-card-main">

                      <div className="my-reservations-cover cancelled">
                        ✓
                      </div>


                      <div className="my-reservations-details">

                        <div className="my-reservations-title-row">

                          <div>
                            <h3>
                              {reservation.title}
                            </h3>

                            <p>
                              by {reservation.author}
                            </p>
                          </div>

                          <span className="my-reservations-status cancelled">
                            CANCELLED
                          </span>

                        </div>


                        <div className="my-reservations-meta">

                          <div>
                            <span>Reserved</span>

                            <strong>
                              {new Date(
                                reservation.reservation_date
                              ).toLocaleDateString()}
                            </strong>
                          </div>

                          <div>
                            <span>Reference</span>

                            <strong>
                              #{reservation.reservation_id}
                            </strong>
                          </div>

                        </div>

                      </div>

                    </div>

                  </article>

                ))}

              </div>

            </section>

          )}

        </div>
      </main>
    </>
  );
}

export default MyReservations;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function Account() {
  const navigate = useNavigate();

  const [borrowedCount, setBorrowedCount] = useState(0);
  const [reservationCount, setReservationCount] = useState(0);
  const [fineAmount, setFineAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    let completed = 0;

    const checkComplete = () => {
      completed++;

      if (completed === 3) {
        setLoading(false);
      }
    };

    axios
      .get(
        `http://localhost:5000/api/my-borrowed-books/${user.user_id}`
      )
      .then((response) => {
        const activeBooks = response.data.filter(
          (book) => book.status !== "returned"
        );

        setBorrowedCount(activeBooks.length);
      })
      .catch(() => {})
      .finally(checkComplete);

    axios
      .get(
        `http://localhost:5000/api/my-reservations/${user.user_id}`
      )
      .then((response) => {
        const activeReservations = response.data.filter(
          (reservation) => reservation.status === "active"
        );

        setReservationCount(activeReservations.length);
      })
      .catch(() => {})
      .finally(checkComplete);

    axios
      .get(
        `http://localhost:5000/api/my-fines/${user.user_id}`
      )
      .then((response) => {
        const unpaid = response.data
          .filter((fine) => fine.status === "unpaid")
          .reduce(
            (total, fine) => total + Number(fine.amount),
            0
          );

        setFineAmount(unpaid);
      })
      .catch(() => {})
      .finally(checkComplete);
  }, []);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="account-page">
          <div className="account-container">

            <div className="account-loading">
              <div className="account-loading-icon">
                👤
              </div>

              <h2>Loading your account...</h2>

              <p>
                Please wait while we retrieve your library
                activity.
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

      <main className="account-page">
        <div className="account-container">

          {/* HEADER */}

          <section className="account-header">

            <div className="account-profile-heading">

              <div className="account-avatar">
                {user.name
                  ? user.name.charAt(0).toUpperCase()
                  : "U"}
              </div>

              <div>
                <span className="account-eyebrow">
                  MY ACCOUNT
                </span>

                <h1>Account Profile</h1>

                <p>
                  View your SmartLibrary account information
                  and library activity.
                </p>
              </div>

            </div>

          </section>


          {/* ACCOUNT STATS */}

          <section className="account-stats">

            <div className="account-stat-card">

              <div className="account-stat-icon">
                📚
              </div>

              <div>
                <span>Borrowed Books</span>

                <strong>
                  {borrowedCount}
                </strong>

                <p>Currently borrowed</p>
              </div>

            </div>


            <div className="account-stat-card">

              <div className="account-stat-icon">
                🔖
              </div>

              <div>
                <span>Reservations</span>

                <strong>
                  {reservationCount}
                </strong>

                <p>Active reservations</p>
              </div>

            </div>


            <div className="account-stat-card">

              <div
                className={
                  fineAmount > 0
                    ? "account-stat-icon fine"
                    : "account-stat-icon clear"
                }
              >
                ₹
              </div>

              <div>
                <span>Outstanding Fines</span>

                <strong
                  className={
                    fineAmount > 0
                      ? "account-fine-number"
                      : "account-clear-number"
                  }
                >
                  ₹{fineAmount.toFixed(2)}
                </strong>

                <p>Current balance</p>
              </div>

            </div>

          </section>


          {/* PERSONAL INFORMATION */}

          <section className="account-info-card">

            <div className="account-section-heading">

              <div>
                <span>PROFILE DETAILS</span>

                <h2>Personal Information</h2>

                <p>
                  Information associated with your
                  SmartLibrary account.
                </p>
              </div>

              <div className="account-member-badge">
                STUDENT
              </div>

            </div>


            <div className="account-info-grid">

              <div className="account-info-item">

                <span>FULL NAME</span>

                <strong>
                  👤 {user.name}
                </strong>

              </div>


              <div className="account-info-item">

                <span>EMAIL ADDRESS</span>

                <strong>
                  📧 {user.email}
                </strong>

              </div>


              <div className="account-info-item">

                <span>USER ID</span>

                <strong>
                  🆔 #{user.user_id}
                </strong>

              </div>


              <div className="account-info-item">

                <span>ACCOUNT TYPE</span>

                <strong>
                  🎓 {user.role || "student"}
                </strong>

              </div>

            </div>

          </section>


          {/* QUICK ACCESS */}

          <section className="account-quick-section">

            <div className="account-section-heading">

              <div>
                <span>LIBRARY SHORTCUTS</span>

                <h2>Quick Access</h2>

                <p>
                  Quickly jump to your most-used library
                  services.
                </p>
              </div>

            </div>


            <div className="account-quick-grid">

              {/* MY LIBRARY */}

              <article className="account-quick-card">

                <div className="account-quick-icon">
                  📖
                </div>

                <div className="account-quick-content">

                  <h3>My Library</h3>

                  <p>
                    View your borrowed books, due dates and
                    borrowing history.
                  </p>

                  <button
                    onClick={() =>
                      navigate("/my-borrowed-books")
                    }
                  >
                    View Books
                    <span>→</span>
                  </button>

                </div>

              </article>


              {/* RESERVATIONS */}

              <article className="account-quick-card">

                <div className="account-quick-icon">
                  🔖
                </div>

                <div className="account-quick-content">

                  <h3>Reservations</h3>

                  <p>
                    Manage your active reservations and
                    reservation history.
                  </p>

                  <button
                    onClick={() =>
                      navigate("/my-reservations")
                    }
                  >
                    View Reservations
                    <span>→</span>
                  </button>

                </div>

              </article>


              {/* FINES */}

              <article className="account-quick-card">

                <div className="account-quick-icon">
                  💳
                </div>

                <div className="account-quick-content">

                  <h3>Fines & Payments</h3>

                  <p>
                    Review your fines, outstanding balance
                    and payment status.
                  </p>

                  <button
                    onClick={() =>
                      navigate("/my-fines")
                    }
                  >
                    View Fines
                    <span>→</span>
                  </button>

                </div>

              </article>

            </div>

          </section>

        </div>
      </main>
    </>
  );
}

export default Account;
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function ReturnBook() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    loadBorrowedBooks();
  }, []);

  const loadBorrowedBooks = () => {
    axios
      .get(
        `http://localhost:5000/api/my-borrowed-books/${user.user_id}`
      )
      .then((response) => {
        const activeBooks = response.data.filter(
          (book) => book.status !== "returned"
        );

        setBorrowedBooks(activeBooks);
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to load borrowed books");
        setLoading(false);
      });
  };

  const handleReturn = async (borrowId) => {
    const confirmReturn = window.confirm(
      "Are you sure you want to return this book?"
    );

    if (!confirmReturn) {
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/return-book",
        {
          borrow_id: borrowId
        }
      );

      alert(response.data.message);

      loadBorrowedBooks();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Book return failed"
      );
    }
  };

  return (
    <>
      <Navbar />

      <main className="return-book-page">
        <div className="return-book-container">

          {/* HEADER */}

          <section className="return-book-header">
            <div>
              <span className="return-book-eyebrow">
                LIBRARY SERVICES
              </span>

              <h1>Return a Book</h1>

              <p>
                Select a borrowed book below and return it
                to the library when you're finished reading.
              </p>
            </div>

            <button
              className="return-book-back-btn"
              onClick={() =>
                navigate("/my-borrowed-books")
              }
            >
              ← My Library
            </button>
          </section>


          {/* INFO STRIP */}

          <section className="return-book-info">
            <div className="return-book-info-icon">
              ↩
            </div>

            <div>
              <strong>Ready to return a book?</strong>

              <p>
                Choose one of your active loans below.
                Your borrowing record will be updated after
                the return is completed.
              </p>
            </div>
          </section>


          {/* LOADING */}

          {loading ? (

            <div className="return-book-empty">
              <div className="return-book-empty-icon">
                📚
              </div>

              <h3>Loading your books...</h3>

              <p>
                Please wait while we load your borrowed books.
              </p>
            </div>

          ) : borrowedBooks.length > 0 ? (

            <section className="return-book-list">

              <div className="return-book-list-heading">
                <div>
                  <span>ACTIVE LOANS</span>
                  <h2>Your Borrowed Books</h2>
                </div>

                <div className="return-book-count">
                  {borrowedBooks.length}{" "}
                  {borrowedBooks.length === 1
                    ? "Book"
                    : "Books"}
                </div>
              </div>


              <div className="return-book-cards">

                {borrowedBooks.map((book) => (

                  <article
                    className={`return-book-card ${
                      book.status === "overdue"
                        ? "overdue"
                        : ""
                    }`}
                    key={book.borrow_id}
                  >

                    <div className="return-book-card-main">

                      <div
                        className={`return-book-cover ${
                          book.status === "overdue"
                            ? "overdue"
                            : ""
                        }`}
                      >
                        {book.status === "overdue"
                          ? "⚠️"
                          : "📖"}
                      </div>


                      <div className="return-book-details">

                        <div className="return-book-title-row">

                          <div>
                            <h3>{book.title}</h3>

                            <p>
                              by {book.author}
                            </p>
                          </div>

                          <span
                            className={`return-book-status ${
                              book.status === "overdue"
                                ? "overdue"
                                : "borrowed"
                            }`}
                          >
                            {book.status === "overdue"
                              ? "OVERDUE"
                              : "BORROWED"}
                          </span>

                        </div>


                        <div className="return-book-meta">

                          <div>
                            <span>Borrowed</span>

                            <strong>
                              {new Date(
                                book.borrow_date
                              ).toLocaleDateString()}
                            </strong>
                          </div>

                          <div>
                            <span>Due Date</span>

                            <strong
                              className={
                                book.status === "overdue"
                                  ? "danger"
                                  : ""
                              }
                            >
                              {new Date(
                                book.due_date
                              ).toLocaleDateString()}
                            </strong>
                          </div>

                          <div>
                            <span>Reference</span>

                            <strong>
                              #{book.borrow_id}
                            </strong>
                          </div>

                        </div>


                        {book.status === "overdue" && (
                          <div className="return-book-overdue-note">
                            ⚠️ This book is overdue. Returning it
                            may result in an outstanding fine.
                          </div>
                        )}

                      </div>

                    </div>


                    <div className="return-book-action">

                      <button
                        className="return-book-submit"
                        onClick={() =>
                          handleReturn(book.borrow_id)
                        }
                      >
                        <span>↩</span>
                        Return Book
                      </button>

                    </div>

                  </article>

                ))}

              </div>

            </section>

          ) : (

            <div className="return-book-empty">

              <div className="return-book-empty-icon success">
                ✓
              </div>

              <h3>No books to return</h3>

              <p>
                You don't currently have any borrowed books.
                Your library account is all clear.
              </p>

              <button
                className="return-book-explore-btn"
                onClick={() => navigate("/books")}
              >
                Explore Books →
              </button>

            </div>

          )}

        </div>
      </main>
    </>
  );
}

export default ReturnBook;
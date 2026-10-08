import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function BorrowBook() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/books")
      .then((response) => {
        setBooks(response.data);
      })
      .catch(() => {
        alert("Failed to load books");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleBorrow = async (bookId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/borrow",
        {
          user_id: user.user_id,
          book_id: bookId
        }
      );

      alert(response.data.message);

      setBooks((currentBooks) =>
        currentBooks.map((book) =>
          book.book_id === bookId
            ? {
                ...book,
                available_quantity:
                  book.available_quantity - 1
              }
            : book
        )
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Borrowing failed"
      );
    }
  };

  return (
    <>
      <Navbar />

      <main className="borrow-page">

        <div className="borrow-container">

          {/* Header */}

          <section className="borrow-header">

            <div>
              <span className="borrow-eyebrow">
                LIBRARY SERVICES
              </span>

              <h1>Borrow a Book</h1>

              <p>
                Choose a title from the collection and
                start reading today.
              </p>
            </div>

            <div className="borrow-count">
              <strong>{books.length}</strong>
              <span>Books in collection</span>
            </div>

          </section>


          {/* Information banner */}

          <section className="borrow-info">

            <div className="borrow-info-icon">
              📚
            </div>

            <div>
              <strong>
                Your next read is waiting
              </strong>

              <p>
                Select any available book to borrow.
                Books are issued for a standard
                14-day lending period.
              </p>
            </div>

          </section>


          {/* Loading */}

          {loading ? (

            <div className="borrow-empty">

              <div className="borrow-empty-icon">
                📖
              </div>

              <h3>Loading the collection...</h3>

              <p>
                Please wait while we fetch the latest
                books.
              </p>

            </div>

          ) : books.length === 0 ? (

            <div className="borrow-empty">

              <div className="borrow-empty-icon">
                📚
              </div>

              <h3>No books available</h3>

              <p>
                There are currently no books in the
                library collection.
              </p>

            </div>

          ) : (

            <div className="borrow-grid">

              {books.map((book) => (

                <article
                  className="borrow-card"
                  key={book.book_id}
                >

                  {/* Cover */}

                  <div className="borrow-cover">

                    <div className="borrow-cover-icon">
                      📖
                    </div>

                    <span
                      className={
                        book.available_quantity > 0
                          ? "borrow-status available"
                          : "borrow-status unavailable"
                      }
                    >
                      {book.available_quantity > 0
                        ? "Available"
                        : "Unavailable"}
                    </span>

                  </div>


                  {/* Content */}

                  <div className="borrow-content">

                    <h3>{book.title}</h3>

                    <p className="borrow-author">
                      by {book.author}
                    </p>

                    <div className="borrow-availability">

                      <span>Copies available</span>

                      <strong>
                        {book.available_quantity}
                      </strong>

                    </div>


                    <div className="borrow-actions">

                      <button
                        className="borrow-details-btn"
                        onClick={() =>
                          navigate(
                            `/book/${book.book_id}`
                          )
                        }
                      >
                        View Details
                      </button>

                      <button
                        className="borrow-submit-btn"
                        disabled={
                          book.available_quantity <= 0
                        }
                        onClick={() =>
                          handleBorrow(book.book_id)
                        }
                      >
                        {book.available_quantity > 0
                          ? "Borrow Book →"
                          : "Unavailable"}
                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </div>

      </main>
    </>
  );
}

export default BorrowBook;
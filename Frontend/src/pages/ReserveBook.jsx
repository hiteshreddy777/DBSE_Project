import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function ReserveBook() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/books")
      .then((response) => {
        setBooks(response.data);
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to load books");
        setLoading(false);
      });
  }, []);

  const handleReserve = async (bookId) => {
    if (!user) {
      alert("Please login to reserve a book.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/reserve",
        {
          user_id: user.user_id,
          book_id: bookId
        }
      );

      alert(response.data.message);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Reservation failed"
      );
    }
  };

  return (
    <>
      <Navbar />

      <main className="reserve-book-page">
        <div className="reserve-book-container">

          {/* HEADER */}

          <section className="reserve-book-header">

            <div>
              <span className="reserve-book-eyebrow">
                LIBRARY SERVICES
              </span>

              <h1>Reserve a Book</h1>

              <p>
                Save a title to your reservation list and
                keep track of books you're interested in.
              </p>
            </div>

          </section>


          {/* INFO BANNER */}

          <div className="reserve-book-info">

            <div className="reserve-book-info-icon">
              💡
            </div>

            <div>
              <strong>How reservations work</strong>

              <p>
                Reserving a book lets the library know that
                you're interested in borrowing it.
              </p>
            </div>

          </div>


          {/* BOOK COUNT */}

          {!loading && (
            <div className="reserve-book-results">

              <div>
                <span className="reserve-book-results-label">
                  AVAILABLE TITLES
                </span>

                <h2>Choose a book to reserve</h2>
              </div>

              <span className="reserve-book-count">
                {books.length}{" "}
                {books.length === 1 ? "book" : "books"}
              </span>

            </div>
          )}


          {/* LOADING */}

          {loading ? (

            <div className="reserve-book-loading">

              <div className="reserve-book-loading-icon">
                📚
              </div>

              <h2>Loading books...</h2>

              <p>
                Please wait while we load the library
                collection.
              </p>

            </div>

          ) : books.length > 0 ? (

            <div className="reserve-book-grid">

              {books.map((book) => (

                <article
                  className="reserve-book-card"
                  key={book.book_id}
                >

                  <div className="reserve-book-cover">
                    <span>🔖</span>
                  </div>


                  <div className="reserve-book-content">

                    <div className="reserve-book-title-area">

                      <h3>{book.title}</h3>

                      <p>
                        by {book.author}
                      </p>

                    </div>


                    <div
                      className={
                        book.available_quantity > 0
                          ? "reserve-book-availability available"
                          : "reserve-book-availability unavailable"
                      }
                    >

                      <span className="reserve-book-dot">
                        ●
                      </span>

                      {book.available_quantity > 0
                        ? `${book.available_quantity} ${
                            book.available_quantity === 1
                              ? "copy"
                              : "copies"
                          } available`
                        : "Currently unavailable"}

                    </div>


                    <button
                      className="reserve-book-submit"
                      onClick={() =>
                        handleReserve(book.book_id)
                      }
                    >
                      Reserve Book
                      <span>→</span>
                    </button>

                  </div>

                </article>

              ))}

            </div>

          ) : (

            <div className="reserve-book-empty">

              <div className="reserve-book-empty-icon">
                📚
              </div>

              <h3>No books available</h3>

              <p>
                There are currently no books to display.
              </p>

            </div>

          )}

        </div>
      </main>
    </>
  );
}

export default ReserveBook;
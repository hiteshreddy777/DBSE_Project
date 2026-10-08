import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function BookDetails() {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/books")
      .then((response) => {
        const foundBook = response.data.find(
          (item) => item.book_id === Number(bookId)
        );

        setBook(foundBook);
        setLoading(false);

        if (foundBook) {
          const existingBooks = JSON.parse(
            localStorage.getItem("recentlyVisitedBooks") || "[]"
          );

          const updatedBooks = [
            foundBook,
            ...existingBooks.filter(
              (item) => item.book_id !== foundBook.book_id
            )
          ].slice(0, 5);

          localStorage.setItem(
            "recentlyVisitedBooks",
            JSON.stringify(updatedBooks)
          );
        }
      })
      .catch(() => {
        setLoading(false);
        alert("Failed to load book details");
      });
  }, [bookId]);

  const handleBorrow = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/borrow",
        {
          user_id: user.user_id,
          book_id: book.book_id
        }
      );

      alert(response.data.message);

      setBook({
        ...book,
        available_quantity:
          book.available_quantity - 1
      });
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Borrowing failed"
      );
    }
  };

  const handleReserve = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/reserve",
        {
          user_id: user.user_id,
          book_id: book.book_id
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

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="book-details-page">
          <div className="book-details-container">
            <div className="book-details-empty">
              <div className="book-details-empty-icon">
                📚
              </div>

              <h3>Loading book details...</h3>

              <p>
                Please wait while we fetch the book
                information.
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!book) {
    return (
      <>
        <Navbar />

        <main className="book-details-page">
          <div className="book-details-container">
            <div className="book-details-empty">

              <div className="book-details-empty-icon">
                🔎
              </div>

              <h3>Book not found</h3>

              <p>
                We couldn't find the book you're
                looking for.
              </p>

              <button
                className="book-details-primary-btn"
                onClick={() => navigate("/books")}
              >
                ← Back to Books
              </button>

            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="book-details-page">

        <div className="book-details-container">

          {/* Back button */}

          <button
            className="book-details-back"
            onClick={() => navigate("/books")}
          >
            ← Back to Books
          </button>


          {/* Main book section */}

          <section className="book-details-card">

            {/* Book cover */}

            <div className="book-details-cover-section">

              <div className="book-details-cover">
                <div className="book-details-cover-icon">
                  📖
                </div>

                <span
                  className={
                    book.available_quantity > 0
                      ? "book-details-status available"
                      : "book-details-status unavailable"
                  }
                >
                  {book.available_quantity > 0
                    ? "Available"
                    : "Unavailable"}
                </span>
              </div>

              <div className="book-details-cover-caption">
                <span>SMARTLIBRARY COLLECTION</span>
                <strong>
                  Book #{book.book_id}
                </strong>
              </div>

            </div>


            {/* Information */}

            <div className="book-details-info">

              <span className="book-details-eyebrow">
                BOOK DETAILS
              </span>

              <h1>{book.title}</h1>

              <p className="book-details-author">
                by <strong>{book.author}</strong>
              </p>


              {/* Availability */}

              <div className="book-details-availability">

                <div className="book-details-availability-icon">
                  {book.available_quantity > 0
                    ? "✓"
                    : "!"}
                </div>

                <div>
                  <span>
                    {book.available_quantity > 0
                      ? "Available to borrow"
                      : "Currently unavailable"}
                  </span>

                  <strong>
                    {book.available_quantity}{" "}
                    {book.available_quantity === 1
                      ? "copy"
                      : "copies"}{" "}
                    available
                  </strong>
                </div>

              </div>


              {/* Metadata */}

              <div className="book-details-meta">

                <div className="book-details-meta-item">
                  <span>ISBN</span>

                  <strong>
                    {book.isbn || "Not available"}
                  </strong>
                </div>

                <div className="book-details-meta-item">
                  <span>Publisher</span>

                  <strong>
                    {book.publisher ||
                      "Not available"}
                  </strong>
                </div>

                <div className="book-details-meta-item">
                  <span>Publication Year</span>

                  <strong>
                    {book.publication_year ||
                      "Not available"}
                  </strong>
                </div>

                <div className="book-details-meta-item">
                  <span>Library ID</span>

                  <strong>
                    #{book.book_id}
                  </strong>
                </div>

              </div>


              {/* Actions */}

              <div className="book-details-actions">

                <button
                  className="book-details-borrow-btn"
                  disabled={
                    book.available_quantity <= 0
                  }
                  onClick={handleBorrow}
                >
                  {book.available_quantity > 0
                    ? "Borrow This Book →"
                    : "Currently Unavailable"}
                </button>

                <button
                  className="book-details-reserve-btn"
                  onClick={handleReserve}
                >
                  🔖 Reserve Book
                </button>

              </div>

              <p className="book-details-note">
                Borrowing a book gives you a standard
                14-day lending period.
              </p>

            </div>

          </section>

        </div>

      </main>
    </>
  );
}

export default BookDetails;
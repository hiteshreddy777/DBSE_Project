import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function BookSearch() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState("all");
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

  const filteredBooks = books.filter((book) => {
    const searchText = search.toLowerCase();

    const searchMatch =
      book.title.toLowerCase().includes(searchText) ||
      book.author.toLowerCase().includes(searchText);

    const availabilityMatch =
      availability === "all" ||
      (availability === "available" &&
        book.available_quantity > 0) ||
      (availability === "unavailable" &&
        book.available_quantity === 0);

    return searchMatch && availabilityMatch;
  });

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

  const handleReserve = async (bookId) => {
    if (!user) {
      navigate("/login");
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

  const clearFilters = () => {
    setSearch("");
    setAvailability("all");
  };

  return (
    <div className="book-search-page">

      <Navbar />

      <main className="book-search-main">

        {/* Header */}
        <section className="book-search-header">

          <div>
            <span className="book-search-eyebrow">
              DIGITAL LIBRARY
            </span>

            <h1>Explore Books</h1>

            <p>
              Discover your next great read from our
              growing library collection.
            </p>
          </div>

          <div className="book-search-count">
            <strong>{books.length}</strong>
            <span>Total books</span>
          </div>

        </section>

        {/* Search panel */}
        <section className="book-search-controls">

          <div className="book-search-input-wrap">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                className="book-search-clear"
                onClick={() => setSearch("")}
                type="button"
              >
                ×
              </button>
            )}
          </div>

          <div className="book-search-filter-wrap">

            <label>Availability</label>

            <select
              value={availability}
              onChange={(e) =>
                setAvailability(e.target.value)
              }
            >
              <option value="all">
                All Books
              </option>

              <option value="available">
                Available
              </option>

              <option value="unavailable">
                Unavailable
              </option>
            </select>

          </div>

        </section>

        {/* Results heading */}
        <div className="book-results-header">

          <div>
            <span>LIBRARY COLLECTION</span>

            <h2>
              {search
                ? `Results for "${search}"`
                : "All Books"}
            </h2>
          </div>

          <p>
            {filteredBooks.length}{" "}
            {filteredBooks.length === 1
              ? "book"
              : "books"} found
          </p>

        </div>

        {/* Loading */}
        {loading ? (

          <div className="book-search-empty">
            <div className="book-empty-icon">
              📚
            </div>

            <h3>Loading the collection...</h3>

            <p>
              Please wait while we fetch the latest
              books from the library.
            </p>
          </div>

        ) : filteredBooks.length > 0 ? (

          <div className="book-search-grid">

            {filteredBooks.map((book) => (

              <article
                className="book-search-card"
                key={book.book_id}
              >

                {/* Cover */}
                <div className="book-search-cover">

                  <div className="book-cover-symbol">
                    📖
                  </div>

                  <span
                    className={
                      book.available_quantity > 0
                        ? "book-availability available"
                        : "book-availability unavailable"
                    }
                  >
                    {book.available_quantity > 0
                      ? "Available"
                      : "Unavailable"}
                  </span>

                </div>

                {/* Content */}
                <div className="book-search-content">

                  <div className="book-search-title-area">

                    <h3>{book.title}</h3>

                    <p>
                      by {book.author}
                    </p>

                  </div>

                  <div className="book-copy-info">

                    <span className="book-copy-icon">
                      📚
                    </span>

                    <span>
                      {book.available_quantity}{" "}
                      {book.available_quantity === 1
                        ? "copy"
                        : "copies"}{" "}
                      available
                    </span>

                  </div>

                  {/* Actions */}
                  <div className="book-search-actions">

                    <button
                      className="book-details-btn"
                      onClick={() =>
                        navigate(
                          `/book/${book.book_id}`
                        )
                      }
                    >
                      View Details
                    </button>

                    <button
                      className="book-borrow-btn"
                      disabled={
                        book.available_quantity <= 0
                      }
                      onClick={() =>
                        handleBorrow(book.book_id)
                      }
                    >
                      {book.available_quantity > 0
                        ? "Borrow"
                        : "Unavailable"}
                    </button>

                    <button
                      className="book-reserve-btn"
                      onClick={() =>
                        handleReserve(book.book_id)
                      }
                    >
                      🔖 Reserve
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>

        ) : (

          <div className="book-search-empty">

            <div className="book-empty-icon">
              🔎
            </div>

            <h3>No books found</h3>

            <p>
              Try searching with a different title
              or author, or clear your filters.
            </p>

            <button
              className="book-show-all-btn"
              onClick={clearFilters}
            >
              Show All Books
            </button>

          </div>

        )}

      </main>

    </div>
  );
}

export default BookSearch;
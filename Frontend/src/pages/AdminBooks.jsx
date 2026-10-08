import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";

function AdminBooks() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
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

    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:5000/api/books"
      );

      setBooks(response.data);
    } catch (error) {
      alert("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/admin/books/${bookId}`
      );

      alert(response.data.message);

      loadBooks();
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to delete book"
      );
    }
  };

  const filteredBooks = books.filter((book) => {
    const searchText = search.toLowerCase();

    return (
      book.title?.toLowerCase().includes(searchText) ||
      book.author?.toLowerCase().includes(searchText)
    );
  });

  return (
    <>
      <AdminNavbar />

      <main className="page">
        <div className="container">

          {/* Header */}
          <div
            className="library-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              marginBottom: "25px"
            }}
          >
            <div>
              <div className="eyebrow">
                ADMINISTRATION
              </div>

              <h1>Manage Books</h1>

              <p>
                Add, edit, search and manage the books available
                in the library.
              </p>
            </div>

            <button
              className="primary-btn"
              onClick={() => navigate("/admin/books/add")}
            >
              + Add New Book
            </button>
          </div>

          {/* Search */}
          <div
            style={{
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "18px",
              marginBottom: "25px"
            }}
          >
            <input
              type="text"
              placeholder="Search by book title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{
                width: "100%",
                maxWidth: "500px"
              }}
            />
          </div>

          {/* Loading */}
          {loading ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>Loading books...</h3>
              <p>Please wait while the library books are loaded.</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>

              <h3>No books found</h3>

              <p>
                {search
                  ? "No books match your search."
                  : "There are no books in the library yet."}
              </p>
            </div>
          ) : (
            <div
              style={{
                background: "white",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                overflow: "hidden"
              }}
            >
              {/* Table Header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "0.5fr 2fr 1.5fr 0.8fr 0.8fr 1.4fr",
                  gap: "15px",
                  padding: "18px 20px",
                  background: "#f5f7f6",
                  borderBottom: "1px solid var(--border)",
                  fontWeight: "700",
                  color: "#344943",
                  fontSize: "13px"
                }}
              >
                <span>ID</span>
                <span>Book</span>
                <span>Author</span>
                <span>Year</span>
                <span>Available</span>
                <span>Actions</span>
              </div>

              {/* Books */}
              {filteredBooks.map((book) => (
                <div
                  key={book.book_id}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "0.5fr 2fr 1.5fr 0.8fr 0.8fr 1.4fr",
                    gap: "15px",
                    alignItems: "center",
                    padding: "18px 20px",
                    borderBottom: "1px solid var(--border)",
                    fontSize: "14px"
                  }}
                >
                  <span
                    style={{
                      fontWeight: "600",
                      color: "#65736e"
                    }}
                  >
                    #{book.book_id}
                  </span>

                  <div>
                    <div
                      style={{
                        fontWeight: "700",
                        color: "#344943",
                        marginBottom: "4px"
                      }}
                    >
                      {book.title}
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#7b8783"
                      }}
                    >
                      ISBN: {book.isbn || "Not available"}
                    </div>
                  </div>

                  <span style={{ color: "#52615c" }}>
                    {book.author}
                  </span>

                  <span style={{ color: "#52615c" }}>
                    {book.publication_year || "-"}
                  </span>

                  <span>
                    <strong
                      style={{
                        color:
                          book.available_quantity > 0
                            ? "#3f6b58"
                            : "#b25d5d"
                      }}
                    >
                      {book.available_quantity}
                    </strong>

                    <span style={{ color: "#89938f" }}>
                      {" "}
                      / {book.quantity}
                    </span>
                  </span>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap"
                    }}
                  >
                    <button
                      className="secondary-btn"
                      onClick={() =>
                        navigate(
                          `/admin/books/edit/${book.book_id}`
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="secondary-btn"
                      onClick={() =>
                        handleDelete(book.book_id)
                      }
                      style={{
                        color: "#a04f4f"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Book Count */}
          {!loading && filteredBooks.length > 0 && (
            <div
              style={{
                marginTop: "18px",
                color: "#71807a",
                fontSize: "13px"
              }}
            >
              Showing {filteredBooks.length} of {books.length} books
            </div>
          )}

        </div>
      </main>
    </>
  );
}

export default AdminBooks;
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";

function AdminEditBook() {
  const navigate = useNavigate();
  const { bookId } = useParams();

  const user = JSON.parse(localStorage.getItem("user"));

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    publication_year: "",
    quantity: "",
    category_id: ""
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    loadData();
  }, [navigate, bookId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const booksResponse = await axios.get(
        "http://localhost:5000/api/books"
      );

      const book = booksResponse.data.find(
        (item) => item.book_id === Number(bookId)
      );

      if (!book) {
        alert("Book not found");
        navigate("/admin/books");
        return;
      }

      setFormData({
        title: book.title || "",
        author: book.author || "",
        isbn: book.isbn || "",
        publisher: book.publisher || "",
        publication_year: book.publication_year || "",
        quantity: book.quantity || "",
        category_id: book.category_id || ""
      });

      const categoriesResponse = await axios.get(
        "http://localhost:5000/api/categories"
      );

      setCategories(categoriesResponse.data);
    } catch (error) {
      alert("Failed to load book details");
      navigate("/admin/books");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/books/${bookId}`,
        {
          ...formData,
          quantity: Number(formData.quantity),
          publication_year: formData.publication_year
            ? Number(formData.publication_year)
            : null,
          category_id: Number(formData.category_id)
        }
      );

      alert(response.data.message);

      navigate("/admin/books");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to update book"
      );
    }
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />

        <main className="admin-edit-book-page">
          <div className="admin-edit-book-container">
            <div className="admin-edit-book-state">
              <div className="admin-edit-book-state-icon">
                📚
              </div>

              <h3>Loading book...</h3>

              <p>
                Please wait while we load the book details.
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />

      <main className="admin-edit-book-page">
        <div className="admin-edit-book-container">

          {/* Header */}
          <section className="admin-edit-book-header">

            <button
              className="admin-edit-book-back"
              onClick={() => navigate("/admin/books")}
            >
              ← Back to Books
            </button>

            <span className="admin-edit-book-eyebrow">
              BOOK MANAGEMENT
            </span>

            <h1>Edit Book</h1>

            <p>
              Update the information and availability details
              for this library book.
            </p>

          </section>

          {/* Book identifier */}
          <div className="admin-edit-book-identifier">
            <div className="admin-edit-book-identifier-icon">
              📖
            </div>

            <div>
              <span>EDITING BOOK</span>
              <strong>#{bookId}</strong>
            </div>
          </div>

          {/* Form */}
          <section className="admin-edit-book-card">

            <div className="admin-edit-book-card-header">

              <div className="admin-edit-book-card-icon">
                ✏️
              </div>

              <div>
                <h2>Book Information</h2>

                <p>
                  Make the required changes and save them
                  to update the library record.
                </p>
              </div>

            </div>

            <form onSubmit={handleSubmit}>

              {/* Basic Information */}
              <div className="admin-edit-book-section">

                <div className="admin-edit-book-section-heading">
                  <span>01</span>

                  <div>
                    <h3>Basic Information</h3>

                    <p>
                      Update the title, author and publication
                      details.
                    </p>
                  </div>
                </div>

                <div className="admin-edit-book-grid">

                  <div className="admin-edit-book-field full">
                    <label>
                      Book Title <span>*</span>
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="admin-edit-book-field">
                    <label>
                      Author <span>*</span>
                    </label>

                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="admin-edit-book-field">
                    <label>ISBN</label>

                    <input
                      type="text"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="admin-edit-book-field">
                    <label>Publisher</label>

                    <input
                      type="text"
                      name="publisher"
                      value={formData.publisher}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="admin-edit-book-field">
                    <label>Publication Year</label>

                    <input
                      type="number"
                      name="publication_year"
                      value={formData.publication_year}
                      onChange={handleChange}
                    />
                  </div>

                </div>

              </div>

              {/* Library Details */}
              <div className="admin-edit-book-section">

                <div className="admin-edit-book-section-heading">
                  <span>02</span>

                  <div>
                    <h3>Library Details</h3>

                    <p>
                      Update the collection quantity and
                      category.
                    </p>
                  </div>
                </div>

                <div className="admin-edit-book-grid">

                  <div className="admin-edit-book-field">
                    <label>
                      Total Quantity <span>*</span>
                    </label>

                    <input
                      type="number"
                      min="1"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />

                    <small>
                      Quantity changes are applied to the
                      library collection.
                    </small>
                  </div>

                  <div className="admin-edit-book-field">
                    <label>
                      Category <span>*</span>
                    </label>

                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        Select a category
                      </option>

                      {categories.map((category) => (
                        <option
                          key={category.category_id}
                          value={category.category_id}
                        >
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

              </div>

              {/* Actions */}
              <div className="admin-edit-book-actions">

                <button
                  type="button"
                  className="admin-edit-book-cancel"
                  onClick={() =>
                    navigate("/admin/books")
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-edit-book-save"
                >
                  ✓ Save Changes
                </button>

              </div>

            </form>

          </section>

          <div className="admin-edit-book-note">
            <span>💡</span>

            <p>
              Changes will be reflected in the library
              collection immediately after saving.
            </p>
          </div>

        </div>
      </main>
    </>
  );
}

export default AdminEditBook;
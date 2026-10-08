import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";

function AdminAddBook() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [publisher, setPublisher] = useState("");
  const [publicationYear, setPublicationYear] = useState("");
  const [quantity, setQuantity] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState("");

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

    loadCategories();
  }, [navigate]);

  const loadCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/categories"
      );

      setCategories(response.data);
    } catch (error) {
      alert("Failed to load categories");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/categories",
        {
          category_name: newCategory.trim()
        }
      );

      alert(response.data.message);

      setNewCategory("");
      setShowCategoryForm(false);

      await loadCategories();

      setCategoryId(response.data.category_id);
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to add category"
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !author || !quantity || !categoryId) {
      alert(
        "Please fill in title, author, quantity and category"
      );
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/books",
        {
          title,
          author,
          isbn,
          publisher,
          publication_year: publicationYear,
          quantity,
          category_id: categoryId
        }
      );

      alert(response.data.message);

      navigate("/admin/books");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to add book"
      );
    }
  };

  return (
    <>
      <AdminNavbar />

      <main className="admin-add-book-page">
        <div className="admin-add-book-container">

          {/* Header */}
          <section className="admin-add-book-header">

            <button
              className="admin-add-book-back"
              onClick={() => navigate("/admin/books")}
            >
              ← Back to Books
            </button>

            <span className="admin-add-book-eyebrow">
              BOOK MANAGEMENT
            </span>

            <h1>Add New Book</h1>

            <p>
              Add a new title to the SmartLibrary collection
              and make it available to students.
            </p>

          </section>

          {/* Form Card */}
          <section className="admin-add-book-card">

            <div className="admin-add-book-card-header">

              <div className="admin-add-book-card-icon">
                📚
              </div>

              <div>
                <h2>Book Information</h2>

                <p>
                  Enter the details of the book below.
                </p>
              </div>

            </div>

            <form onSubmit={handleSubmit}>

              {/* Basic Information */}
              <div className="admin-add-book-section">

                <div className="admin-add-book-section-heading">
                  <span>01</span>

                  <div>
                    <h3>Basic Information</h3>

                    <p>
                      Main details about the book.
                    </p>
                  </div>
                </div>

                <div className="admin-add-book-grid">

                  <div className="admin-add-book-field full">
                    <label>
                      Book Title
                      <span>*</span>
                    </label>

                    <input
                      type="text"
                      placeholder="Enter book title"
                      value={title}
                      onChange={(e) =>
                        setTitle(e.target.value)
                      }
                    />
                  </div>

                  <div className="admin-add-book-field">
                    <label>
                      Author
                      <span>*</span>
                    </label>

                    <input
                      type="text"
                      placeholder="Enter author name"
                      value={author}
                      onChange={(e) =>
                        setAuthor(e.target.value)
                      }
                    />
                  </div>

                  <div className="admin-add-book-field">
                    <label>ISBN</label>

                    <input
                      type="text"
                      placeholder="Enter ISBN"
                      value={isbn}
                      onChange={(e) =>
                        setIsbn(e.target.value)
                      }
                    />
                  </div>

                  <div className="admin-add-book-field">
                    <label>Publisher</label>

                    <input
                      type="text"
                      placeholder="Enter publisher name"
                      value={publisher}
                      onChange={(e) =>
                        setPublisher(e.target.value)
                      }
                    />
                  </div>

                  <div className="admin-add-book-field">
                    <label>Publication Year</label>

                    <input
                      type="number"
                      min="0"
                      placeholder="Example: 2024"
                      value={publicationYear}
                      onChange={(e) =>
                        setPublicationYear(e.target.value)
                      }
                    />
                  </div>

                </div>

              </div>

              {/* Library Details */}
              <div className="admin-add-book-section">

                <div className="admin-add-book-section-heading">
                  <span>02</span>

                  <div>
                    <h3>Library Details</h3>

                    <p>
                      Set the category and number of copies.
                    </p>
                  </div>
                </div>

                <div className="admin-add-book-grid">

                  <div className="admin-add-book-field">
                    <label>
                      Total Quantity
                      <span>*</span>
                    </label>

                    <input
                      type="number"
                      min="1"
                      placeholder="Number of copies"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(e.target.value)
                      }
                    />

                    <small>
                      All copies will initially be marked
                      as available.
                    </small>
                  </div>

                  <div className="admin-add-book-field">
                    <label>
                      Category
                      <span>*</span>
                    </label>

                    <select
                      value={categoryId}
                      onChange={(e) =>
                        setCategoryId(e.target.value)
                      }
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

                {/* Category Creation */}
                <button
                  type="button"
                  className="admin-add-book-category-toggle"
                  onClick={() =>
                    setShowCategoryForm(!showCategoryForm)
                  }
                >
                  <span>
                    {showCategoryForm ? "−" : "+"}
                  </span>

                  {showCategoryForm
                    ? "Close category form"
                    : "Create a new category"}
                </button>

                {showCategoryForm && (
                  <div className="admin-add-book-category-box">

                    <div>
                      <strong>
                        Create New Category
                      </strong>

                      <p>
                        Add a category if the book does not
                        fit an existing one.
                      </p>
                    </div>

                    <div className="admin-add-book-category-form">

                      <input
                        type="text"
                        placeholder="Example: Fiction"
                        value={newCategory}
                        onChange={(e) =>
                          setNewCategory(e.target.value)
                        }
                      />

                      <button
                        type="button"
                        onClick={handleAddCategory}
                      >
                        Add Category
                      </button>

                    </div>

                  </div>
                )}

              </div>

              {/* Actions */}
              <div className="admin-add-book-actions">

                <button
                  type="button"
                  className="admin-add-book-cancel"
                  onClick={() =>
                    navigate("/admin/books")
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-add-book-submit"
                >
                  <span>＋</span>
                  Add Book to Library
                </button>

              </div>

            </form>

          </section>

          {/* Small note */}
          <div className="admin-add-book-note">
            <span>💡</span>

            <p>
              Once added, the book will appear immediately
              in the library collection and can be edited
              from Book Management.
            </p>
          </div>

        </div>
      </main>
    </>
  );
}

export default AdminAddBook;
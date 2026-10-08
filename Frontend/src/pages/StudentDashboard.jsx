import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function StudentDashboard() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const [books, setBooks] = useState([]);
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [fines, setFines] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);

            await axios.get(
                `http://localhost:5000/api/check-overdue/${user.user_id}`
            );

            const [
                booksResponse,
                borrowedResponse,
                reservationsResponse,
                finesResponse
            ] = await Promise.all([
                axios.get("http://localhost:5000/api/books"),
                axios.get(
                    `http://localhost:5000/api/my-borrowed-books/${user.user_id}`
                ),
                axios.get(
                    `http://localhost:5000/api/my-reservations/${user.user_id}`
                ),
                axios.get(
                    `http://localhost:5000/api/my-fines/${user.user_id}`
                )
            ]);

            setBooks(booksResponse.data || []);
            setBorrowedBooks(borrowedResponse.data || []);
            setReservations(reservationsResponse.data || []);
            setFines(finesResponse.data || []);

        } catch (error) {
            console.error("Dashboard loading error:", error);
        } finally {
            setLoading(false);
        }
    };

    const availableBooks = books.filter(
        (book) => Number(book.available_quantity) > 0
    );

    const activeBorrowedBooks = borrowedBooks.filter(
        (book) => book.status !== "returned"
    );

    const activeReservations = reservations.filter(
        (reservation) => reservation.status === "active"
    );

    const unpaidFines = fines.filter(
        (fine) => fine.status === "unpaid"
    );

    const totalFineAmount = unpaidFines.reduce(
        (total, fine) => total + Number(fine.amount || 0),
        0
    );

    const getBookTitle = (book) => {
        return book.title || book.book_title || "Library Book";
    };

    const getAuthor = (book) => {
        return book.author || "Unknown Author";
    };

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div className="student-dashboard-page">

            <Navbar />

            <main className="student-dashboard">

                {/* Hero */}
                <section className="student-welcome">

                    <div className="student-welcome-content">

                        <span className="student-eyebrow">
                            STUDENT LIBRARY PORTAL
                        </span>

                        <h1>
                            Welcome back, {user?.name?.split(" ")[0] || "Student"}.
                        </h1>

                        <p>
                            Discover books, manage your borrowing activity,
                            and keep track of your library account.
                        </p>

                        <div className="student-hero-actions">

                            <button
                                className="student-primary-action"
                                onClick={() => navigate("/books")}
                            >
                                Explore Books
                                <span>→</span>
                            </button>

                            <button
                                className="student-secondary-action"
                                onClick={() => navigate("/my-borrowed-books")}
                            >
                                My Borrowed Books
                            </button>

                        </div>

                    </div>

                    <div className="student-hero-decoration">
                        <div className="hero-book-icon">📚</div>

                        <div className="hero-floating-card">
                            <strong>{availableBooks.length}</strong>
                            <span>Books available</span>
                        </div>
                    </div>

                </section>

                {/* Statistics */}
                <section className="student-stat-grid">

                    <div className="student-stat-card">
                        <div className="student-stat-icon">📚</div>

                        <div>
                            <span>Available Books</span>
                            <strong>
                                {loading ? "—" : availableBooks.length}
                            </strong>
                        </div>
                    </div>

                    <div className="student-stat-card">
                        <div className="student-stat-icon">📖</div>

                        <div>
                            <span>Currently Borrowed</span>
                            <strong>
                                {loading ? "—" : activeBorrowedBooks.length}
                            </strong>
                        </div>
                    </div>

                    <div className="student-stat-card">
                        <div className="student-stat-icon">🔖</div>

                        <div>
                            <span>Active Reservations</span>
                            <strong>
                                {loading ? "—" : activeReservations.length}
                            </strong>
                        </div>
                    </div>

                    <div className="student-stat-card">
                        <div className="student-stat-icon">₹</div>

                        <div>
                            <span>Unpaid Fines</span>
                            <strong>
                                {loading
                                    ? "—"
                                    : `₹${totalFineAmount.toFixed(2)}`}
                            </strong>
                        </div>
                    </div>

                </section>

                {/* Main content */}
                <section className="student-dashboard-grid">

                    {/* Borrowed books */}
                    <div className="student-dashboard-panel">

                        <div className="student-panel-header">

                            <div>
                                <span className="student-panel-label">
                                    YOUR ACTIVITY
                                </span>

                                <h2>Currently Borrowed</h2>
                            </div>

                            <button
                                onClick={() =>
                                    navigate("/my-borrowed-books")
                                }
                            >
                                View all →
                            </button>

                        </div>

                        {loading ? (
                            <div className="student-empty-state">
                                Loading your books...
                            </div>
                        ) : activeBorrowedBooks.length === 0 ? (

                            <div className="student-empty-state">

                                <div className="empty-icon">📖</div>

                                <h3>No borrowed books</h3>

                                <p>
                                    You don't have any books borrowed right now.
                                </p>

                                <button
                                    onClick={() => navigate("/books")}
                                >
                                    Find a book
                                </button>

                            </div>

                        ) : (

                            <div className="student-book-list">

                                {activeBorrowedBooks
                                    .slice(0, 4)
                                    .map((book) => (

                                        <div
                                            className="student-book-row"
                                            key={book.borrow_id}
                                        >

                                            <div className="student-book-cover">
                                                📕
                                            </div>

                                            <div className="student-book-info">

                                                <h3>
                                                    {getBookTitle(book)}
                                                </h3>

                                                <p>
                                                    {getAuthor(book)}
                                                </p>

                                            </div>

                                            <div className="student-book-due">

                                                <span>Due date</span>

                                                <strong>
                                                    {formatDate(book.due_date)}
                                                </strong>

                                            </div>

                                            <span
                                                className={`student-status ${
                                                    book.status === "overdue"
                                                        ? "student-status-overdue"
                                                        : "student-status-active"
                                                }`}
                                            >
                                                {book.status || "borrowed"}
                                            </span>

                                        </div>

                                    ))}

                            </div>

                        )}

                    </div>

                    {/* Quick actions */}
                    <div className="student-dashboard-panel student-quick-panel">

                        <div className="student-panel-header">

                            <div>
                                <span className="student-panel-label">
                                    LIBRARY SERVICES
                                </span>

                                <h2>Quick Actions</h2>
                            </div>

                        </div>

                        <div className="student-quick-actions">

                            <button
                                onClick={() => navigate("/books")}
                            >
                                <span className="quick-action-icon">🔎</span>

                                <div>
                                    <strong>Search Books</strong>
                                    <small>Find your next book</small>
                                </div>

                                <span className="quick-arrow">→</span>
                            </button>

                            <button
                                onClick={() => navigate("/borrow")}
                            >
                                <span className="quick-action-icon">📚</span>

                                <div>
                                    <strong>Borrow a Book</strong>
                                    <small>Start reading today</small>
                                </div>

                                <span className="quick-arrow">→</span>
                            </button>

                            <button
                                onClick={() => navigate("/my-reservations")}
                            >
                                <span className="quick-action-icon">🔖</span>

                                <div>
                                    <strong>Reservations</strong>
                                    <small>Manage your reservations</small>
                                </div>

                                <span className="quick-arrow">→</span>
                            </button>

                            <button
                                onClick={() => navigate("/my-fines")}
                            >
                                <span className="quick-action-icon">₹</span>

                                <div>
                                    <strong>My Fines</strong>
                                    <small>View payment status</small>
                                </div>

                                <span className="quick-arrow">→</span>
                            </button>

                        </div>

                    </div>

                </section>

                {/* Recommended / recently added */}
                <section className="student-dashboard-panel student-library-panel">

                    <div className="student-panel-header">

                        <div>
                            <span className="student-panel-label">
                                LIBRARY COLLECTION
                            </span>

                            <h2>Explore the Collection</h2>
                        </div>

                        <button
                            onClick={() => navigate("/books")}
                        >
                            Browse all books →
                        </button>

                    </div>

                    <div className="student-book-cards">

                        {books.length === 0 ? (

                            <div className="student-empty-state">
                                No books available right now.
                            </div>

                        ) : (

                            books.slice(0, 4).map((book, index) => (

                                <div
                                    className="student-library-book"
                                    key={book.book_id || index}
                                    onClick={() =>
                                        navigate(`/book/${book.book_id}`)
                                    }
                                >

                                    <div className="library-book-visual">
                                        <span>📖</span>
                                    </div>

                                    <div className="library-book-details">

                                        <h3>
                                            {getBookTitle(book)}
                                        </h3>

                                        <p>
                                            {getAuthor(book)}
                                        </p>

                                        <span>
                                            {Number(book.available_quantity) > 0
                                                ? `${book.available_quantity} available`
                                                : "Currently unavailable"}
                                        </span>

                                    </div>

                                </div>

                            ))

                        )}

                    </div>

                </section>

                {/* Account summary */}
                <section className="student-account-strip">

                    <div>
                        <span>YOUR LIBRARY ACCOUNT</span>

                        <h2>
                            Keep your library activity organized.
                        </h2>

                        <p>
                            Review your profile, borrowing history,
                            reservations and account details anytime.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/account")}
                    >
                        View My Account →
                    </button>

                </section>

            </main>

        </div>
    );
}

export default StudentDashboard;
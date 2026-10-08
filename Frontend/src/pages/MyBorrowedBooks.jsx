import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function MyBorrowedBooks() {

    const navigate = useNavigate();

    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [extendingId, setExtendingId] = useState(null);

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    useEffect(() => {

        if (!user) {
            navigate("/login");
            return;
        }

        loadBorrowedBooks();

    }, []);

    const loadBorrowedBooks = async () => {

        try {

            setLoading(true);

            await axios.get(
                `http://localhost:5000/api/check-overdue/${user.user_id}`
            );

            const borrowedResponse = await axios.get(
                `http://localhost:5000/api/my-borrowed-books/${user.user_id}`
            );

            const finesResponse = await axios.get(
                `http://localhost:5000/api/my-fines/${user.user_id}`
            );

            setBorrowedBooks(
                borrowedResponse.data
            );

            setFines(
                finesResponse.data
            );

        } catch (error) {

            console.error(
                "Failed to load borrowed books:",
                error
            );

        } finally {

            setLoading(false);

        }

    };

    const handleExtend = async (borrowId) => {

        try {

            setExtendingId(borrowId);

            const response = await axios.put(
                `http://localhost:5000/api/borrowing/${borrowId}/extend`,
                {
                    user_id: user.user_id
                }
            );

            alert(
                `${response.data.message}\nNew due date: ${formatDate(response.data.new_due_date)}`
            );

            await loadBorrowedBooks();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Unable to extend borrowing period"
            );

        } finally {

            setExtendingId(null);

        }

    };

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };

    const getDaysUntilDue = (dueDate) => {

        if (!dueDate) {
            return null;
        }

        const today = new Date();
        const due = new Date(dueDate);

        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);

        const difference =
            due.getTime() -
            today.getTime();

        return Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );

    };

    const getFineForBorrow = (borrowId) => {

        return fines.find(
            (fine) =>
                fine.borrow_id === borrowId &&
                fine.status === "unpaid"
        );

    };

    const activeBooks = borrowedBooks.filter(
        (book) =>
            book.status === "borrowed" ||
            book.status === "overdue"
    );

    const returnedBooks = borrowedBooks.filter(
        (book) =>
            book.status === "returned"
    );

    const overdueBooks = borrowedBooks.filter(
        (book) =>
            book.status === "overdue"
    );

    const unpaidFines = fines.filter(
        (fine) =>
            fine.status === "unpaid"
    );

    const totalUnpaid = unpaidFines.reduce(
        (total, fine) =>
            total + Number(fine.amount || 0),
        0
    );

    if (loading) {

        return (
            <div className="my-borrowed-page">

                <div className="my-borrowed-loading">

                    <div className="my-borrowed-loading-icon">
                        📚
                    </div>

                    <h2>
                        Loading your library...
                    </h2>

                    <p>
                        Checking your borrowed books and due dates.
                    </p>

                </div>

            </div>
        );

    }

    return (

        <div className="my-borrowed-page">

            <div className="my-borrowed-container">

                {/* HEADER */}

                <div className="my-borrowed-header">

                    <div>

                        <div className="my-borrowed-eyebrow">
                            MY LIBRARY
                        </div>

                        <h1>
                            My Borrowed Books
                        </h1>

                        <p>
                            Keep track of your current books,
                            due dates and borrowing history.
                        </p>

                    </div>

                    <button
                        className="my-borrowed-find-btn"
                        onClick={() =>
                            navigate("/books")
                        }
                    >
                        + Find More Books
                    </button>

                </div>


                {/* RETURN REMINDERS */}

                {activeBooks.map((book) => {

                    const daysUntilDue =
                        getDaysUntilDue(book.due_date);

                    const isDueSoon =
                        book.status === "borrowed" &&
                        daysUntilDue !== null &&
                        daysUntilDue >= 0 &&
                        daysUntilDue <= 2;

                    if (!isDueSoon) {
                        return null;
                    }

                    return (

                        <div
                            className="my-borrowed-warning"
                            key={`warning-${book.borrow_id}`}
                        >

                            <div className="my-borrowed-warning-icon">
                                🔔
                            </div>

                            <div className="my-borrowed-warning-content">

                                <div className="my-borrowed-warning-title">
                                    Book due soon
                                </div>

                                <p>
                                    <strong>
                                        {book.title}
                                    </strong>{" "}
                                    is due on{" "}
                                    <strong>
                                        {formatDate(book.due_date)}
                                    </strong>.
                                </p>

                                <p>
                                    Would you like to return it
                                    or extend your borrowing period?
                                </p>

                                <div className="my-borrowed-warning-actions">

                                    <button
                                        className="my-borrowed-warning-btn"
                                        onClick={() =>
                                            navigate("/return-book")
                                        }
                                    >
                                        ↩ Return Book
                                    </button>

                                    <button
                                        className="my-borrowed-extend-btn"
                                        onClick={() =>
                                            handleExtend(
                                                book.borrow_id
                                            )
                                        }
                                        disabled={
                                            extendingId ===
                                            book.borrow_id
                                        }
                                    >
                                        {extendingId ===
                                        book.borrow_id
                                            ? "Extending..."
                                            : "📅 Extend 7 Days"
                                        }
                                    </button>

                                </div>

                            </div>

                        </div>

                    );

                })}


                {/* OVERDUE WARNING */}

                {overdueBooks.length > 0 && (

                    <div className="my-borrowed-warning my-borrowed-overdue-warning">

                        <div className="my-borrowed-warning-icon">
                            ⚠️
                        </div>

                        <div className="my-borrowed-warning-content">

                            <div className="my-borrowed-warning-title">
                                Overdue books
                            </div>

                            <p>
                                You currently have{" "}
                                <strong>
                                    {overdueBooks.length}
                                </strong>{" "}
                                overdue book
                                {overdueBooks.length !== 1
                                    ? "s"
                                    : ""}.
                            </p>

                            <p>
                                Please return the book as soon as
                                possible to avoid increasing fines.
                            </p>

                            {totalUnpaid > 0 && (

                                <p>
                                    Current unpaid fines:{" "}
                                    <strong>
                                        ₹{totalUnpaid.toFixed(2)}
                                    </strong>
                                </p>

                            )}

                            <button
                                className="my-borrowed-warning-btn"
                                onClick={() =>
                                    navigate("/return-book")
                                }
                            >
                                ↩ Return Book
                            </button>

                        </div>

                    </div>

                )}


                {/* OVERVIEW */}

                <div className="my-borrowed-overview">

                    <div className="my-borrowed-stat-card">

                        <div className="my-borrowed-stat-icon">
                            📖
                        </div>

                        <span className="my-borrowed-stat-label">
                            Currently Borrowed
                        </span>

                        <strong className="my-borrowed-stat-number">
                            {activeBooks.length}
                        </strong>

                    </div>


                    <div className="my-borrowed-stat-card">

                        <div className="my-borrowed-stat-icon">
                            ⏰
                        </div>

                        <span className="my-borrowed-stat-label">
                            Overdue
                        </span>

                        <strong className="my-borrowed-stat-number">
                            {overdueBooks.length}
                        </strong>

                    </div>


                    <div className="my-borrowed-stat-card">

                        <div className="my-borrowed-stat-icon">
                            ✓
                        </div>

                        <span className="my-borrowed-stat-label">
                            Returned
                        </span>

                        <strong className="my-borrowed-stat-number">
                            {returnedBooks.length}
                        </strong>

                    </div>


                    <div className="my-borrowed-stat-card">

                        <div className="my-borrowed-stat-icon">
                            💸
                        </div>

                        <span className="my-borrowed-stat-label">
                            Unpaid Fines
                        </span>

                        <strong className="my-borrowed-stat-number">
                            ₹{totalUnpaid.toFixed(2)}
                        </strong>

                    </div>

                </div>


                {/* CURRENT BOOKS */}

                <div className="my-borrowed-section">

                    <div className="my-borrowed-section-heading">

                        <div>

                            <span className="my-borrowed-section-label">
                                CURRENTLY WITH YOU
                            </span>

                            <h2>
                                Active Borrowings
                            </h2>

                        </div>

                        <span className="my-borrowed-section-count">
                            {activeBooks.length}
                        </span>

                    </div>


                    {activeBooks.length > 0 ? (

                        <div className="my-borrowed-list">

                            {activeBooks.map((book) => {

                                const daysUntilDue =
                                    getDaysUntilDue(
                                        book.due_date
                                    );

                                const fine =
                                    getFineForBorrow(
                                        book.borrow_id
                                    );

                                return (

                                    <div
                                        className="my-borrowed-book"
                                        key={book.borrow_id}
                                    >

                                        <div className="my-borrowed-book-main">

                                            <div className="my-borrowed-book-cover">
                                                📚
                                            </div>


                                            <div className="my-borrowed-book-info">

                                                <div className="my-borrowed-book-top">

                                                    <h3>
                                                        {book.title}
                                                    </h3>

                                                    <span
                                                        className={`my-borrowed-status ${
                                                            book.status
                                                        }`}
                                                    >
                                                        {book.status ===
                                                        "overdue"
                                                            ? "Overdue"
                                                            : "Borrowed"
                                                        }
                                                    </span>

                                                </div>


                                                <p className="my-borrowed-author">
                                                    {book.author}
                                                </p>


                                                <div className="my-borrowed-meta">

                                                    <span>
                                                        Borrowed:{" "}
                                                        {formatDate(
                                                            book.borrow_date
                                                        )}
                                                    </span>

                                                    <span>
                                                        Due:{" "}
                                                        {formatDate(
                                                            book.due_date
                                                        )}
                                                    </span>

                                                </div>


                                                {book.status ===
                                                    "overdue" && (

                                                    <div className="my-borrowed-overdue-note">

                                                        ⚠️ Overdue
                                                        {fine && (
                                                            <>
                                                                {" "}· Fine: ₹
                                                                {Number(
                                                                    fine.amount
                                                                ).toFixed(2)}
                                                            </>
                                                        )}

                                                    </div>

                                                )}


                                                {book.status ===
                                                    "borrowed" &&
                                                    daysUntilDue !== null &&
                                                    daysUntilDue >= 0 &&
                                                    daysUntilDue <= 2 && (

                                                    <div className="my-borrowed-due-soon-note">

                                                        🔔 Due in{" "}
                                                        {daysUntilDue === 0
                                                            ? "today"
                                                            : `${daysUntilDue} day${
                                                                daysUntilDue !==
                                                                1
                                                                    ? "s"
                                                                    : ""
                                                            }`
                                                        }

                                                    </div>

                                                )}

                                            </div>


                                            <div className="my-borrowed-book-action">

                                                <button
                                                    className="my-borrowed-return-btn"
                                                    onClick={() =>
                                                        navigate(
                                                            "/return-book"
                                                        )
                                                    }
                                                >
                                                    ↩ Return
                                                </button>

                                                {book.status ===
                                                    "borrowed" &&
                                                    daysUntilDue !== null &&
                                                    daysUntilDue >= 0 &&
                                                    daysUntilDue <= 2 && (

                                                    <button
                                                        className="my-borrowed-extend-btn"
                                                        onClick={() =>
                                                            handleExtend(
                                                                book.borrow_id
                                                            )
                                                        }
                                                        disabled={
                                                            extendingId ===
                                                            book.borrow_id
                                                        }
                                                    >
                                                        {extendingId ===
                                                        book.borrow_id
                                                            ? "Extending..."
                                                            : "📅 Extend"
                                                        }
                                                    </button>

                                                )}

                                            </div>

                                        </div>

                                    </div>

                                );

                            })}

                        </div>

                    ) : (

                        <div className="my-borrowed-empty">

                            <div className="my-borrowed-empty-icon">
                                📚
                            </div>

                            <h3>
                                No active borrowings
                            </h3>

                            <p>
                                You don't currently have any books borrowed.
                            </p>

                            <button
                                className="my-borrowed-empty-btn"
                                onClick={() =>
                                    navigate("/books")
                                }
                            >
                                Browse Books
                            </button>

                        </div>

                    )}

                </div>


                {/* HISTORY */}

                <div className="my-borrowed-section">

                    <div className="my-borrowed-section-heading">

                        <div>

                            <span className="my-borrowed-section-label">
                                YOUR HISTORY
                            </span>

                            <h2>
                                Returned Books
                            </h2>

                        </div>

                        <span className="my-borrowed-section-count">
                            {returnedBooks.length}
                        </span>

                    </div>


                    {returnedBooks.length > 0 ? (

                        <div className="my-borrowed-list">

                            {returnedBooks.map((book) => (

                                <div
                                    className="my-borrowed-book"
                                    key={book.borrow_id}
                                >

                                    <div className="my-borrowed-book-main">

                                        <div className="my-borrowed-book-cover">
                                            ✓
                                        </div>


                                        <div className="my-borrowed-book-info">

                                            <div className="my-borrowed-book-top">

                                                <h3>
                                                    {book.title}
                                                </h3>

                                                <span className="my-borrowed-status returned">
                                                    Returned
                                                </span>

                                            </div>


                                            <p className="my-borrowed-author">
                                                {book.author}
                                            </p>


                                            <div className="my-borrowed-meta">

                                                <span>
                                                    Borrowed:{" "}
                                                    {formatDate(
                                                        book.borrow_date
                                                    )}
                                                </span>

                                                <span>
                                                    Returned:{" "}
                                                    {formatDate(
                                                        book.return_date
                                                    )}
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    ) : (

                        <div className="my-borrowed-empty">

                            <div className="my-borrowed-empty-icon">
                                🕘
                            </div>

                            <h3>
                                No borrowing history yet
                            </h3>

                            <p>
                                Returned books will appear here.
                            </p>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}

export default MyBorrowedBooks;
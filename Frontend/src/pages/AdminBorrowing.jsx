import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";

function AdminBorrowing() {

    const navigate = useNavigate();

    const [records, setRecords] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    const [editingBorrowId, setEditingBorrowId] = useState(null);
    const [newDueDate, setNewDueDate] = useState("");
    const [savingDate, setSavingDate] = useState(false);

    useEffect(() => {

        const user = JSON.parse(
            localStorage.getItem("user")
        );

        if (!user) {
            navigate("/login");
            return;
        }

        if (user.role !== "admin") {
            navigate("/dashboard");
            return;
        }

        fetchBorrowing();

    }, [navigate]);

    const fetchBorrowing = async () => {

        try {

            setLoading(true);

            const response = await axios.get(
                "http://localhost:5000/api/admin/borrowing"
            );

            setRecords(response.data);

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to load borrowing records"
            );

        } finally {

            setLoading(false);

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

    const formatInputDate = (date) => {

        if (!date) {
            return "";
        }

        const parsedDate = new Date(date);

        const year = parsedDate.getFullYear();
        const month = String(
            parsedDate.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            parsedDate.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;

    };

    const openEditDate = (record) => {

        setEditingBorrowId(record.borrow_id);

        setNewDueDate(
            formatInputDate(record.due_date)
        );

    };

    const cancelEditDate = () => {

        setEditingBorrowId(null);
        setNewDueDate("");

    };

    const updateDueDate = async (borrowId) => {

        if (!newDueDate) {

            alert("Please select a due date");

            return;

        }

        try {

            setSavingDate(true);

            const response = await axios.put(
                `http://localhost:5000/api/admin/borrowing/${borrowId}/due-date`,
                {
                    due_date: newDueDate
                }
            );

            alert(response.data.message);

            setEditingBorrowId(null);
            setNewDueDate("");

            fetchBorrowing();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to update due date"
            );

        } finally {

            setSavingDate(false);

        }

    };

    const filteredRecords = records.filter((record) => {

        const searchText =
            search.toLowerCase().trim();

        const matchesSearch =
            record.student_name
                ?.toLowerCase()
                .includes(searchText) ||

            record.student_email
                ?.toLowerCase()
                .includes(searchText) ||

            record.book_title
                ?.toLowerCase()
                .includes(searchText) ||

            record.book_author
                ?.toLowerCase()
                .includes(searchText);

        const matchesStatus =
            statusFilter === "all" ||
            record.status === statusFilter;

        return (
            matchesSearch &&
            matchesStatus
        );

    });

    const totalRecords =
        records.length;

    const borrowedCount =
        records.filter(
            (record) =>
                record.status === "borrowed"
        ).length;

    const overdueCount =
        records.filter(
            (record) =>
                record.status === "overdue"
        ).length;

    const returnedCount =
        records.filter(
            (record) =>
                record.status === "returned"
        ).length;

    const getStatusClass = (status) => {

        if (status === "returned") {
            return "admin-borrowing-status returned";
        }

        if (status === "overdue") {
            return "admin-borrowing-status overdue";
        }

        return "admin-borrowing-status borrowed";

    };

    return (

        <div className="admin-borrowing-page">

            <AdminNavbar />

            <main className="admin-borrowing-container">

                {/* HEADER */}

                <section className="admin-borrowing-header">

                    <div>

                        <div className="admin-borrowing-eyebrow">
                            BORROWING MANAGEMENT
                        </div>

                        <h1>
                            Borrowing Records
                        </h1>

                        <p>
                            Monitor books currently borrowed,
                            overdue items and return history.
                        </p>

                    </div>

                    <button
                        className="admin-borrowing-refresh"
                        onClick={fetchBorrowing}
                    >
                        ↻ Refresh
                    </button>

                </section>


                {/* STATISTICS */}

                <section className="admin-borrowing-stats">

                    <div className="admin-borrowing-stat-card">

                        <div className="admin-borrowing-stat-icon">
                            📚
                        </div>

                        <div>

                            <span>
                                Total Records
                            </span>

                            <strong>
                                {totalRecords}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-borrowing-stat-card">

                        <div className="admin-borrowing-stat-icon">
                            📖
                        </div>

                        <div>

                            <span>
                                Currently Borrowed
                            </span>

                            <strong>
                                {borrowedCount}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-borrowing-stat-card">

                        <div className="admin-borrowing-stat-icon warning">
                            ⚠
                        </div>

                        <div>

                            <span>
                                Overdue
                            </span>

                            <strong>
                                {overdueCount}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-borrowing-stat-card">

                        <div className="admin-borrowing-stat-icon success">
                            ✓
                        </div>

                        <div>

                            <span>
                                Returned
                            </span>

                            <strong>
                                {returnedCount}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* FILTERS */}

                <section className="admin-borrowing-controls">

                    <div className="admin-borrowing-search">

                        <span>
                            ⌕
                        </span>

                        <input
                            type="text"
                            placeholder="Search student, email, book or author..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>


                    <div className="admin-borrowing-filter">

                        <label>
                            Status
                        </label>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                        >

                            <option value="all">
                                All Records
                            </option>

                            <option value="borrowed">
                                Borrowed
                            </option>

                            <option value="overdue">
                                Overdue
                            </option>

                            <option value="returned">
                                Returned
                            </option>

                        </select>

                    </div>

                </section>


                {/* RESULTS */}

                <section className="admin-borrowing-section">

                    <div className="admin-borrowing-section-top">

                        <div>

                            <h2>
                                Borrowing Activity
                            </h2>

                            <p>
                                Showing{" "}
                                <strong>
                                    {filteredRecords.length}
                                </strong>{" "}
                                records
                            </p>

                        </div>

                    </div>


                    {loading ? (

                        <div className="admin-borrowing-loading">

                            <div className="admin-borrowing-spinner">
                            </div>

                            <p>
                                Loading borrowing records...
                            </p>

                        </div>

                    ) : filteredRecords.length === 0 ? (

                        <div className="admin-borrowing-empty">

                            <div className="admin-borrowing-empty-icon">
                                📚
                            </div>

                            <h3>
                                No borrowing records found
                            </h3>

                            <p>
                                Try changing your search
                                or status filter.
                            </p>

                        </div>

                    ) : (

                        <div className="admin-borrowing-table-wrapper">

                            <table className="admin-borrowing-table">

                                <thead>

                                    <tr>

                                        <th>
                                            ID
                                        </th>

                                        <th>
                                            Student
                                        </th>

                                        <th>
                                            Book
                                        </th>

                                        <th>
                                            Borrowed
                                        </th>

                                        <th>
                                            Due Date
                                        </th>

                                        <th>
                                            Returned
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredRecords.map(
                                        (record) => (

                                            <tr
                                                key={
                                                    record.borrow_id
                                                }
                                            >

                                                <td>

                                                    <span className="admin-borrowing-id">
                                                        #
                                                        {
                                                            record.borrow_id
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="admin-borrowing-student">

                                                        <div className="admin-borrowing-avatar">
                                                            {record.student_name
                                                                ?.charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    record.student_name
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    record.student_email
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>

                                                    <div className="admin-borrowing-book">

                                                        <div className="admin-borrowing-book-icon">
                                                            📖
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    record.book_title
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    record.book_author
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>
                                                    {
                                                        formatDate(
                                                            record.borrow_date
                                                        )
                                                    }
                                                </td>


                                                <td>

                                                    {editingBorrowId ===
                                                    record.borrow_id ? (

                                                        <div className="admin-borrowing-date-editor">

                                                            <input
                                                                type="date"
                                                                value={
                                                                    newDueDate
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    setNewDueDate(
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />

                                                            <div className="admin-borrowing-date-actions">

                                                                <button
                                                                    className="admin-borrowing-save-date"
                                                                    onClick={() =>
                                                                        updateDueDate(
                                                                            record.borrow_id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        savingDate
                                                                    }
                                                                >
                                                                    {savingDate
                                                                        ? "Saving..."
                                                                        : "Save"}
                                                                </button>

                                                                <button
                                                                    className="admin-borrowing-cancel-date"
                                                                    onClick={
                                                                        cancelEditDate
                                                                    }
                                                                    disabled={
                                                                        savingDate
                                                                    }
                                                                >
                                                                    Cancel
                                                                </button>

                                                            </div>

                                                        </div>

                                                    ) : (

                                                        <div className="admin-borrowing-due-cell">

                                                            <span>
                                                                {
                                                                    formatDate(
                                                                        record.due_date
                                                                    )
                                                                }
                                                            </span>

                                                            {record.status !==
                                                                "returned" && (

                                                                <button
                                                                    className="admin-borrowing-edit-date"
                                                                    onClick={() =>
                                                                        openEditDate(
                                                                            record
                                                                        )
                                                                    }
                                                                >
                                                                    ✏️ Edit
                                                                </button>

                                                            )}

                                                        </div>

                                                    )}

                                                </td>


                                                <td>
                                                    {
                                                        formatDate(
                                                            record.return_date
                                                        )
                                                    }
                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            getStatusClass(
                                                                record.status
                                                            )
                                                        }
                                                    >

                                                        <span className="admin-borrowing-status-dot">
                                                        </span>

                                                        {
                                                            record.status
                                                                ?.charAt(0)
                                                                .toUpperCase() +
                                                            record.status?.slice(
                                                                1
                                                            )
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    {record.status ===
                                                        "returned" ? (

                                                        <span className="admin-borrowing-no-action">
                                                            Completed
                                                        </span>

                                                    ) : (

                                                        <button
                                                            className="admin-borrowing-action-button"
                                                            onClick={() =>
                                                                openEditDate(
                                                                    record
                                                                )
                                                            }
                                                        >
                                                            ✏️
                                                            <span>
                                                                Due Date
                                                            </span>
                                                        </button>

                                                    )}

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </main>

        </div>

    );
}

export default AdminBorrowing;
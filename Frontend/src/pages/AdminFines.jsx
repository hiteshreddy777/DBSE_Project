import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";

function AdminFines() {

    const navigate = useNavigate();

    const [fines, setFines] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    const [editingFineId, setEditingFineId] = useState(null);
    const [newAmount, setNewAmount] = useState("");
    const [savingAmount, setSavingAmount] = useState(false);

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

        fetchFines();

    }, [navigate]);

    const fetchFines = async () => {

        try {

            setLoading(true);

            const response = await axios.get(
                "http://localhost:5000/api/admin/fines"
            );

            setFines(response.data);

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to load fines"
            );

        } finally {

            setLoading(false);

        }

    };

    const markAsPaid = async (fineId) => {

        const confirmPayment = window.confirm(
            "Are you sure you want to mark this fine as paid?"
        );

        if (!confirmPayment) {
            return;
        }

        try {

            const response = await axios.put(
                `http://localhost:5000/api/admin/fines/${fineId}/pay`
            );

            alert(response.data.message);

            fetchFines();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to update fine"
            );

        }

    };

    const openEditAmount = (fine) => {

        setEditingFineId(fine.fine_id);

        setNewAmount(
            Number(fine.amount).toFixed(2)
        );

    };

    const cancelEditAmount = () => {

        setEditingFineId(null);
        setNewAmount("");

    };

    const updateFineAmount = async (fineId) => {

        if (
            newAmount === "" ||
            Number(newAmount) <= 0
        ) {

            alert(
                "Please enter a valid fine amount"
            );

            return;

        }

        try {

            setSavingAmount(true);

            const response = await axios.put(
                `http://localhost:5000/api/admin/fines/${fineId}/amount`,
                {
                    amount: Number(newAmount)
                }
            );

            alert(response.data.message);

            setEditingFineId(null);
            setNewAmount("");

            fetchFines();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to update fine amount"
            );

        } finally {

            setSavingAmount(false);

        }

    };

    const filteredFines = fines.filter((fine) => {

        const searchText =
            search.toLowerCase().trim();

        const matchesSearch =
            fine.student_name
                ?.toLowerCase()
                .includes(searchText) ||

            fine.student_email
                ?.toLowerCase()
                .includes(searchText) ||

            fine.book_title
                ?.toLowerCase()
                .includes(searchText) ||

            fine.book_author
                ?.toLowerCase()
                .includes(searchText);

        const matchesStatus =
            statusFilter === "all" ||
            fine.status === statusFilter;

        return (
            matchesSearch &&
            matchesStatus
        );

    });

    const totalFines = fines.reduce(
        (sum, fine) =>
            sum + Number(fine.amount || 0),
        0
    );

    const unpaidFines = fines
        .filter(
            (fine) =>
                fine.status === "unpaid"
        )
        .reduce(
            (sum, fine) =>
                sum + Number(fine.amount || 0),
            0
        );

    const paidFines = fines
        .filter(
            (fine) =>
                fine.status === "paid"
        )
        .reduce(
            (sum, fine) =>
                sum + Number(fine.amount || 0),
            0
        );

    const unpaidCount = fines.filter(
        (fine) =>
            fine.status === "unpaid"
    ).length;

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

    const formatAmount = (amount) => {

        return `₹${Number(amount || 0).toFixed(2)}`;

    };

    return (

        <div className="admin-fines-page">

            <AdminNavbar />

            <main className="admin-fines-container">

                <section className="admin-fines-header">

                    <div>

                        <div className="admin-fines-eyebrow">
                            FINE MANAGEMENT
                        </div>

                        <h1>
                            Fines & Payments
                        </h1>

                        <p>
                            Monitor outstanding fines and
                            manage student payments.
                        </p>

                    </div>

                    <button
                        className="admin-fines-refresh"
                        onClick={fetchFines}
                    >
                        ↻ Refresh
                    </button>

                </section>


                <section className="admin-fines-summary">

                    <div className="admin-fines-summary-card">

                        <div className="admin-fines-summary-icon">
                            ₹
                        </div>

                        <div>

                            <span>
                                Total Fines
                            </span>

                            <strong>
                                {formatAmount(totalFines)}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-fines-summary-card">

                        <div className="admin-fines-summary-icon warning">
                            !
                        </div>

                        <div>

                            <span>
                                Outstanding
                            </span>

                            <strong>
                                {formatAmount(unpaidFines)}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-fines-summary-card">

                        <div className="admin-fines-summary-icon success">
                            ✓
                        </div>

                        <div>

                            <span>
                                Paid
                            </span>

                            <strong>
                                {formatAmount(paidFines)}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-fines-summary-card">

                        <div className="admin-fines-summary-icon danger">
                            #
                        </div>

                        <div>

                            <span>
                                Unpaid Records
                            </span>

                            <strong>
                                {unpaidCount}
                            </strong>

                        </div>

                    </div>

                </section>


                <section className="admin-fines-controls">

                    <div className="admin-fines-search">

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


                    <div className="admin-fines-filter">

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
                                All Fines
                            </option>

                            <option value="unpaid">
                                Unpaid
                            </option>

                            <option value="paid">
                                Paid
                            </option>

                        </select>

                    </div>

                </section>


                <section className="admin-fines-section">

                    <div className="admin-fines-section-top">

                        <div>

                            <h2>
                                Fine Records
                            </h2>

                            <p>
                                Showing{" "}
                                <strong>
                                    {filteredFines.length}
                                </strong>{" "}
                                records
                            </p>

                        </div>

                    </div>


                    {loading ? (

                        <div className="admin-fines-loading">

                            <div className="admin-fines-spinner">
                            </div>

                            <p>
                                Loading fine records...
                            </p>

                        </div>

                    ) : filteredFines.length === 0 ? (

                        <div className="admin-fines-empty">

                            <div className="admin-fines-empty-icon">
                                ✓
                            </div>

                            <h3>
                                No fine records found
                            </h3>

                            <p>
                                Try changing your search
                                or status filter.
                            </p>

                        </div>

                    ) : (

                        <div className="admin-fines-table-wrapper">

                            <table className="admin-fines-table">

                                <thead>

                                    <tr>

                                        <th>ID</th>
                                        <th>Student</th>
                                        <th>Book</th>
                                        <th>Amount</th>
                                        <th>Created</th>
                                        <th>Status</th>
                                        <th>Action</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredFines.map(
                                        (fine) => (

                                            <tr
                                                key={
                                                    fine.fine_id
                                                }
                                            >

                                                <td>

                                                    <span className="admin-fines-id">
                                                        #
                                                        {
                                                            fine.fine_id
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="admin-fines-student">

                                                        <div className="admin-fines-avatar">
                                                            {fine.student_name
                                                                ?.charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    fine.student_name
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    fine.student_email
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>

                                                    <div className="admin-fines-book">

                                                        <div className="admin-fines-book-icon">
                                                            📖
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    fine.book_title
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    fine.book_author
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>

                                                    {editingFineId ===
                                                    fine.fine_id ? (

                                                        <div className="admin-fines-amount-editor">

                                                            <div className="admin-fines-input-wrapper">

                                                                <span>
                                                                    ₹
                                                                </span>

                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    step="0.01"
                                                                    value={
                                                                        newAmount
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setNewAmount(
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    autoFocus
                                                                />

                                                            </div>

                                                            <div className="admin-fines-amount-actions">

                                                                <button
                                                                    className="admin-fines-save-button"
                                                                    onClick={() =>
                                                                        updateFineAmount(
                                                                            fine.fine_id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        savingAmount
                                                                    }
                                                                >
                                                                    {savingAmount
                                                                        ? "Saving..."
                                                                        : "Save"}
                                                                </button>

                                                                <button
                                                                    className="admin-fines-cancel-button"
                                                                    onClick={
                                                                        cancelEditAmount
                                                                    }
                                                                    disabled={
                                                                        savingAmount
                                                                    }
                                                                >
                                                                    Cancel
                                                                </button>

                                                            </div>

                                                        </div>

                                                    ) : (

                                                        <div className="admin-fines-amount-cell">

                                                            <strong>
                                                                {
                                                                    formatAmount(
                                                                        fine.amount
                                                                    )
                                                                }
                                                            </strong>

                                                            {fine.status ===
                                                                "unpaid" && (

                                                                <button
                                                                    className="admin-fines-edit-button"
                                                                    onClick={() =>
                                                                        openEditAmount(
                                                                            fine
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
                                                            fine.created_at
                                                        )
                                                    }
                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            fine.status ===
                                                            "paid"
                                                                ? "admin-fines-status paid"
                                                                : "admin-fines-status unpaid"
                                                        }
                                                    >

                                                        <span className="admin-fines-status-dot">
                                                        </span>

                                                        {
                                                            fine.status
                                                                ?.charAt(0)
                                                                .toUpperCase() +
                                                            fine.status?.slice(
                                                                1
                                                            )
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    {fine.status ===
                                                    "unpaid" ? (

                                                        <div className="admin-fines-actions">

                                                            <button
                                                                className="admin-fines-action-edit"
                                                                onClick={() =>
                                                                    openEditAmount(
                                                                        fine
                                                                    )
                                                                }
                                                            >
                                                                ✏️
                                                                <span>
                                                                    Amount
                                                                </span>
                                                            </button>

                                                            <button
                                                                className="admin-fines-action-pay"
                                                                onClick={() =>
                                                                    markAsPaid(
                                                                        fine.fine_id
                                                                    )
                                                                }
                                                            >
                                                                ✓
                                                                <span>
                                                                    Mark Paid
                                                                </span>
                                                            </button>

                                                        </div>

                                                    ) : (

                                                        <span className="admin-fines-completed">
                                                            ✓ Paid
                                                        </span>

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

export default AdminFines;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";

function AdminReports() {

    const navigate = useNavigate();

    const [reports, setReports] = useState({});
    const [loading, setLoading] = useState(true);

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

        fetchReports();

    }, [navigate]);

    const fetchReports = async () => {

        try {

            setLoading(true);

            const response = await axios.get(
                "http://localhost:5000/api/admin/reports"
            );

            setReports(response.data);

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to load reports"
            );

        } finally {

            setLoading(false);

        }

    };

    const getValue = (key) => {

        const value = reports[key];

        return Number(value || 0);

    };

    const formatCurrency = (value) => {

        return `₹${Number(value || 0).toFixed(2)}`;

    };

    const totalBooks =
        getValue("total_books");

    const totalStudents =
        getValue("total_students");

    const totalBorrowings =
        getValue("total_borrowings");

    const activeBorrowings =
        getValue("active_borrowings");

    const overdueBooks =
        getValue("overdue_books");

    const activeReservations =
        getValue("active_reservations");

    const totalFines =
        getValue("total_fines");

    const unpaidFines =
        getValue("unpaid_fines");

    const maxActivity = Math.max(
        totalBorrowings,
        activeBorrowings,
        overdueBooks,
        activeReservations,
        1
    );

    const getBarWidth = (value) => {

        return `${Math.max(
            (value / maxActivity) * 100,
            value > 0 ? 8 : 0
        )}%`;

    };

    return (

        <div className="admin-reports-page">

            <AdminNavbar />

            <main className="admin-reports-container">

                <section className="admin-reports-header">

                    <div>

                        <div className="admin-reports-eyebrow">
                            LIBRARY ANALYTICS
                        </div>

                        <h1>
                            Reports & Insights
                        </h1>

                        <p>
                            View an overview of library
                            activity, borrowing trends
                            and financial records.
                        </p>

                    </div>

                    <button
                        className="admin-reports-refresh"
                        onClick={fetchReports}
                    >
                        ↻ Refresh
                    </button>

                </section>


                {loading ? (

                    <div className="admin-reports-loading">

                        <div className="admin-reports-spinner">
                        </div>

                        <p>
                            Preparing library reports...
                        </p>

                    </div>

                ) : (

                    <>

                        <section className="admin-reports-overview">

                            <div className="admin-reports-card">

                                <div className="admin-reports-card-icon">
                                    📚
                                </div>

                                <div>

                                    <span>
                                        Total Books
                                    </span>

                                    <strong>
                                        {totalBooks}
                                    </strong>

                                    <small>
                                        Library collection
                                    </small>

                                </div>

                            </div>


                            <div className="admin-reports-card">

                                <div className="admin-reports-card-icon">
                                    👨‍🎓
                                </div>

                                <div>

                                    <span>
                                        Total Students
                                    </span>

                                    <strong>
                                        {totalStudents}
                                    </strong>

                                    <small>
                                        Registered students
                                    </small>

                                </div>

                            </div>


                            <div className="admin-reports-card">

                                <div className="admin-reports-card-icon">
                                    📖
                                </div>

                                <div>

                                    <span>
                                        Total Borrowings
                                    </span>

                                    <strong>
                                        {totalBorrowings}
                                    </strong>

                                    <small>
                                        All borrowing records
                                    </small>

                                </div>

                            </div>


                            <div className="admin-reports-card">

                                <div className="admin-reports-card-icon warning">
                                    ⚠
                                </div>

                                <div>

                                    <span>
                                        Overdue Books
                                    </span>

                                    <strong>
                                        {overdueBooks}
                                    </strong>

                                    <small>
                                        Require attention
                                    </small>

                                </div>

                            </div>

                        </section>


                        <section className="admin-reports-grid">

                            <div className="admin-reports-panel">

                                <div className="admin-reports-panel-heading">

                                    <div>

                                        <h2>
                                            Library Activity
                                        </h2>

                                        <p>
                                            Current borrowing
                                            and reservation activity
                                        </p>

                                    </div>

                                    <span className="admin-reports-panel-icon">
                                        📊
                                    </span>

                                </div>


                                <div className="admin-reports-bars">

                                    <div className="admin-reports-bar-item">

                                        <div className="admin-reports-bar-label">

                                            <span>
                                                Total Borrowings
                                            </span>

                                            <strong>
                                                {totalBorrowings}
                                            </strong>

                                        </div>

                                        <div className="admin-reports-bar-track">

                                            <div
                                                className="admin-reports-bar-fill"
                                                style={{
                                                    width:
                                                        getBarWidth(
                                                            totalBorrowings
                                                        )
                                                }}
                                            >
                                            </div>

                                        </div>

                                    </div>


                                    <div className="admin-reports-bar-item">

                                        <div className="admin-reports-bar-label">

                                            <span>
                                                Active Borrowings
                                            </span>

                                            <strong>
                                                {activeBorrowings}
                                            </strong>

                                        </div>

                                        <div className="admin-reports-bar-track">

                                            <div
                                                className="admin-reports-bar-fill active"
                                                style={{
                                                    width:
                                                        getBarWidth(
                                                            activeBorrowings
                                                        )
                                                }}
                                            >
                                            </div>

                                        </div>

                                    </div>


                                    <div className="admin-reports-bar-item">

                                        <div className="admin-reports-bar-label">

                                            <span>
                                                Overdue Books
                                            </span>

                                            <strong>
                                                {overdueBooks}
                                            </strong>

                                        </div>

                                        <div className="admin-reports-bar-track">

                                            <div
                                                className="admin-reports-bar-fill overdue"
                                                style={{
                                                    width:
                                                        getBarWidth(
                                                            overdueBooks
                                                        )
                                                }}
                                            >
                                            </div>

                                        </div>

                                    </div>


                                    <div className="admin-reports-bar-item">

                                        <div className="admin-reports-bar-label">

                                            <span>
                                                Active Reservations
                                            </span>

                                            <strong>
                                                {activeReservations}
                                            </strong>

                                        </div>

                                        <div className="admin-reports-bar-track">

                                            <div
                                                className="admin-reports-bar-fill reservations"
                                                style={{
                                                    width:
                                                        getBarWidth(
                                                            activeReservations
                                                        )
                                                }}
                                            >
                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            <div className="admin-reports-panel">

                                <div className="admin-reports-panel-heading">

                                    <div>

                                        <h2>
                                            Financial Overview
                                        </h2>

                                        <p>
                                            Fine collection summary
                                        </p>

                                    </div>

                                    <span className="admin-reports-panel-icon">
                                        ₹
                                    </span>

                                </div>


                                <div className="admin-reports-finance-list">

                                    <div className="admin-reports-finance-row">

                                        <div className="admin-reports-finance-left">

                                            <span className="admin-reports-finance-dot total">
                                            </span>

                                            <span>
                                                Total Fines
                                            </span>

                                        </div>

                                        <strong>
                                            {formatCurrency(
                                                totalFines
                                            )}
                                        </strong>

                                    </div>


                                    <div className="admin-reports-finance-row">

                                        <div className="admin-reports-finance-left">

                                            <span className="admin-reports-finance-dot unpaid">
                                            </span>

                                            <span>
                                                Unpaid Fines
                                            </span>

                                        </div>

                                        <strong>
                                            {formatCurrency(
                                                unpaidFines
                                            )}
                                        </strong>

                                    </div>


                                    <div className="admin-reports-finance-row">

                                        <div className="admin-reports-finance-left">

                                            <span className="admin-reports-finance-dot paid">
                                            </span>

                                            <span>
                                                Paid Fines
                                            </span>

                                        </div>

                                        <strong>
                                            {formatCurrency(
                                                Math.max(
                                                    totalFines -
                                                    unpaidFines,
                                                    0
                                                )
                                            )}
                                        </strong>

                                    </div>

                                </div>


                                <div className="admin-reports-finance-progress">

                                    <div className="admin-reports-finance-progress-top">

                                        <span>
                                            Collection Status
                                        </span>

                                        <strong>
                                            {totalFines > 0
                                                ? `${Math.round(
                                                    ((totalFines -
                                                        unpaidFines) /
                                                        totalFines) *
                                                        100
                                                )}%`
                                                : "0%"}
                                        </strong>

                                    </div>

                                    <div className="admin-reports-progress-track">

                                        <div
                                            className="admin-reports-progress-fill"
                                            style={{
                                                width:
                                                    totalFines > 0
                                                        ? `${Math.min(
                                                            Math.max(
                                                                ((totalFines -
                                                                    unpaidFines) /
                                                                    totalFines) *
                                                                    100,
                                                                0
                                                            ),
                                                            100
                                                        )}%`
                                                        : "0%"
                                            }}
                                        >
                                        </div>

                                    </div>

                                </div>

                            </div>

                        </section>


                        <section className="admin-reports-secondary">

                            <div className="admin-reports-mini-card">

                                <div className="admin-reports-mini-icon">
                                    📖
                                </div>

                                <div>

                                    <span>
                                        Active Borrowings
                                    </span>

                                    <strong>
                                        {activeBorrowings}
                                    </strong>

                                </div>

                            </div>


                            <div className="admin-reports-mini-card">

                                <div className="admin-reports-mini-icon">
                                    🔖
                                </div>

                                <div>

                                    <span>
                                        Active Reservations
                                    </span>

                                    <strong>
                                        {activeReservations}
                                    </strong>

                                </div>

                            </div>


                            <div className="admin-reports-mini-card">

                                <div className="admin-reports-mini-icon warning">
                                    ⚠
                                </div>

                                <div>

                                    <span>
                                        Overdue Books
                                    </span>

                                    <strong>
                                        {overdueBooks}
                                    </strong>

                                </div>

                            </div>


                            <div className="admin-reports-mini-card">

                                <div className="admin-reports-mini-icon danger">
                                    ₹
                                </div>

                                <div>

                                    <span>
                                        Unpaid Fines
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            unpaidFines
                                        )}
                                    </strong>

                                </div>

                            </div>

                        </section>


                        <section className="admin-reports-note">

                            <div className="admin-reports-note-icon">
                                ✓
                            </div>

                            <div>

                                <h3>
                                    Report generated successfully
                                </h3>

                                <p>
                                    These figures are calculated
                                    from the current library
                                    database and update whenever
                                    you refresh the report.
                                </p>

                            </div>

                        </section>

                    </>

                )}

            </main>

        </div>

    );

}

export default AdminReports;
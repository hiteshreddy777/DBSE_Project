import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function MyFines() {

    const navigate = useNavigate();

    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    useEffect(() => {

        if (!user) {
            navigate("/login");
            return;
        }

        loadFines();

    }, []);

    const loadFines = async () => {

        try {

            setLoading(true);

            /*
                First check all overdue books.

                This automatically updates:
                Day 1  -> ₹20
                Day 2  -> ₹22
                Day 3  -> ₹24
                Day 4  -> ₹26
                etc.
            */

            await axios.get(
                `http://localhost:5000/api/check-overdue/${user.user_id}`
            );

            /*
                After updating overdue fines,
                get the latest fine records.
            */

            const response = await axios.get(
                `http://localhost:5000/api/my-fines/${user.user_id}`
            );

            setFines(response.data);

        } catch (error) {

            console.error(
                "Failed to load fines:",
                error
            );

        } finally {

            setLoading(false);

        }

    };

    const unpaidFines = fines.filter(
        (fine) => fine.status === "unpaid"
    );

    const paidFines = fines.filter(
        (fine) => fine.status === "paid"
    );

    const totalUnpaid = unpaidFines.reduce(
        (total, fine) =>
            total + Number(fine.amount || 0),
        0
    );

    const totalPaid = paidFines.reduce(
        (total, fine) =>
            total + Number(fine.amount || 0),
        0
    );

    const formatCurrency = (amount) => {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2
            }
        ).format(amount);

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

    if (loading) {

        return (
            <div className="my-fines-page">

                <div className="my-fines-loading">

                    <div className="my-fines-loading-icon">
                        💸
                    </div>

                    <h2>
                        Checking your fines...
                    </h2>

                    <p>
                        Updating overdue charges and loading your fine history.
                    </p>

                </div>

            </div>
        );

    }

    return (

        <div className="my-fines-page">

            <div className="my-fines-container">

                {/* HEADER */}

                <div className="my-fines-header">

                    <div>

                        <div className="my-fines-eyebrow">
                            FINES & PAYMENTS
                        </div>

                        <h1>
                            My Fines
                        </h1>

                        <p>
                            Keep track of your outstanding library fines
                            and payment history.
                        </p>

                    </div>

                    <button
                        className="my-fines-books-btn"
                        onClick={() =>
                            navigate("/my-borrowed-books")
                        }
                    >
                        📚 My Borrowed Books
                    </button>

                </div>


                {/* SUMMARY */}

                <div className="my-fines-summary">

                    <div className="my-fines-summary-card">

                        <div className="my-fines-summary-icon">
                            💰
                        </div>

                        <div>

                            <span className="my-fines-summary-label">
                                Unpaid Fines
                            </span>

                            <strong className="my-fines-summary-number">
                                {formatCurrency(totalUnpaid)}
                            </strong>

                        </div>

                    </div>


                    <div className="my-fines-summary-card">

                        <div className="my-fines-summary-icon">
                            ✓
                        </div>

                        <div>

                            <span className="my-fines-summary-label">
                                Paid Fines
                            </span>

                            <strong className="my-fines-summary-number">
                                {formatCurrency(totalPaid)}
                            </strong>

                        </div>

                    </div>


                    <div className="my-fines-balance">

                        <div className="my-fines-balance-icon">
                            {totalUnpaid > 0 ? "⚠️" : "✓"}
                        </div>

                        <div>

                            <span className="my-fines-balance-label">
                                Current Balance
                            </span>

                            <strong>
                                {totalUnpaid > 0
                                    ? `${formatCurrency(totalUnpaid)} due`
                                    : "All clear"
                                }
                            </strong>

                        </div>

                    </div>

                </div>


                {/* FINE HISTORY */}

                <div className="my-fines-history">

                    <div className="my-fines-history-heading">

                        <div>

                            <span className="my-fines-section-label">
                                TRANSACTION HISTORY
                            </span>

                            <h2>
                                Fine Records
                            </h2>

                        </div>

                        <span className="my-fines-count">
                            {fines.length} record
                            {fines.length !== 1 ? "s" : ""}
                        </span>

                    </div>


                    {fines.length > 0 ? (

                        <div className="my-fines-list">

                            {fines.map((fine) => (

                                <div
                                    className="my-fines-card"
                                    key={fine.fine_id}
                                >

                                    <div className="my-fines-card-main">

                                        <div className="my-fines-card-icon">
                                            {fine.status === "paid"
                                                ? "✓"
                                                : "₹"
                                            }
                                        </div>


                                        <div className="my-fines-details">

                                            <div className="my-fines-title-row">

                                                <h3>
                                                    Library Fine
                                                </h3>

                                                <span
                                                    className={`my-fines-status ${
                                                        fine.status === "paid"
                                                            ? "paid"
                                                            : "unpaid"
                                                    }`}
                                                >
                                                    {fine.status === "paid"
                                                        ? "Paid"
                                                        : "Unpaid"
                                                    }
                                                </span>

                                            </div>


                                            <div className="my-fines-meta">

                                                <span>
                                                    Fine ID: #{fine.fine_id}
                                                </span>

                                                <span>
                                                    Borrow ID: #{fine.borrow_id}
                                                </span>

                                                <span>
                                                    Date: {formatDate(
                                                        fine.created_at
                                                    )}
                                                </span>

                                            </div>

                                        </div>


                                        <div className="my-fines-amount">

                                            <strong>
                                                {formatCurrency(
                                                    fine.amount
                                                )}
                                            </strong>

                                            <span>
                                                {fine.status === "paid"
                                                    ? "Payment completed"
                                                    : "Payment pending"
                                                }
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    ) : (

                        <div className="my-fines-empty">

                            <div className="my-fines-empty-icon">
                                ✓
                            </div>

                            <h3>
                                No fines found
                            </h3>

                            <p>
                                You currently don't have any library fines.
                                Keep up the good work!
                            </p>

                            <button
                                className="my-fines-explore-btn"
                                onClick={() =>
                                    navigate("/books")
                                }
                            >
                                Browse Books
                            </button>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}

export default MyFines;
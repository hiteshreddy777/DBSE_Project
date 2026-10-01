require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "harini@0616",
    database: "smart_library"
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err.message);
    } else {
        console.log("MySQL connected successfully!");
    }
});

app.get("/", (req, res) => {
    res.send("Smart Library Backend is running!");
});

app.get("/api/books", (req, res) => {
    const sql = "SELECT * FROM books";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: "Failed to fetch books"
            });
        }

        res.json(results);
    });
});

app.post("/api/borrow", (req, res) => {
    const { user_id, book_id } = req.body;

    if (!user_id || !book_id) {
        return res.status(400).json({
            message: "User ID and Book ID are required"
        });
    }

    const checkBookSql =
        "SELECT available_quantity FROM books WHERE book_id = ?";

    db.query(checkBookSql, [book_id], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to check book"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        if (results[0].available_quantity <= 0) {
            return res.status(400).json({
                message: "Book is not available"
            });
        }

        const borrowDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);

        const borrowSql = `
            INSERT INTO borrowing
            (user_id, book_id, borrow_date, due_date, status)
            VALUES (?, ?, ?, ?, 'borrowed')
        `;

        db.query(
            borrowSql,
            [user_id, book_id, borrowDate, dueDate],
            (err) => {
                if (err) {
                    return res.status(500).json({
                        message: "Borrowing failed"
                    });
                }

                const updateBookSql =
                    "UPDATE books SET available_quantity = available_quantity - 1 WHERE book_id = ?";

                db.query(updateBookSql, [book_id], (err) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Book quantity update failed"
                        });
                    }

                    res.json({
                        message: "Book borrowed successfully"
                    });
                });
            }
        );
    });
});

app.get("/api/my-borrowed-books/:user_id", (req, res) => {
    const { user_id } = req.params;

    const sql = `
        SELECT
            borrowing.borrow_id,
            books.title,
            books.author,
            borrowing.borrow_date,
            borrowing.due_date,
            borrowing.return_date,
            borrowing.status
        FROM borrowing
        JOIN books
        ON borrowing.book_id = books.book_id
        WHERE borrowing.user_id = ?
        ORDER BY borrowing.borrow_date DESC
    `;

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to fetch borrowed books"
            });
        }

        res.json(results);
    });
});

app.post("/api/reserve", (req, res) => {
    const { user_id, book_id } = req.body;

    if (!user_id || !book_id) {
        return res.status(400).json({
            message: "User ID and Book ID are required"
        });
    }

    const checkBookSql =
        "SELECT book_id, available_quantity FROM books WHERE book_id = ?";

    db.query(checkBookSql, [book_id], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to check book"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        const checkReservationSql = `
            SELECT reservation_id
            FROM reservations
            WHERE user_id = ?
            AND book_id = ?
            AND status = 'active'
        `;

        db.query(
            checkReservationSql,
            [user_id, book_id],
            (err, reservations) => {
                if (err) {
                    return res.status(500).json({
                        message: "Failed to check reservation"
                    });
                }

                if (reservations.length > 0) {
                    return res.status(400).json({
                        message: "Book already reserved"
                    });
                }

                const reservationSql = `
                    INSERT INTO reservations
                    (user_id, book_id, status)
                    VALUES (?, ?, 'active')
                `;

                db.query(
                    reservationSql,
                    [user_id, book_id],
                    (err) => {
                        if (err) {
                            return res.status(500).json({
                                message: "Reservation failed"
                            });
                        }

                        res.json({
                            message: "Book reserved successfully"
                        });
                    }
                );
            }
        );
    });
});

app.get("/api/my-reservations/:user_id", (req, res) => {
    const { user_id } = req.params;

    const sql = `
        SELECT
            reservations.reservation_id,
            books.book_id,
            books.title,
            books.author,
            books.available_quantity,
            reservations.reservation_date,
            reservations.status
        FROM reservations
        JOIN books
        ON reservations.book_id = books.book_id
        WHERE reservations.user_id = ?
        ORDER BY reservations.reservation_date DESC
    `;

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to fetch reservations"
            });
        }

        res.json(results);
    });
});

app.get("/api/my-fines/:user_id", (req, res) => {
    const { user_id } = req.params;

    const sql = `
        SELECT
            fines.fine_id,
            fines.borrow_id,
            fines.amount,
            fines.status,
            fines.created_at,
            books.title
        FROM fines
        JOIN borrowing
        ON fines.borrow_id = borrowing.borrow_id
        JOIN books
        ON borrowing.book_id = books.book_id
        WHERE fines.user_id = ?
        ORDER BY fines.created_at DESC
    `;

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to fetch fines"
            });
        }

        res.json(results);
    });
});

app.post("/api/return-book", (req, res) => {
    const { borrow_id } = req.body;

    if (!borrow_id) {
        return res.status(400).json({
            message: "Borrow ID is required"
        });
    }

    const findBorrowSql = `
        SELECT book_id, status
        FROM borrowing
        WHERE borrow_id = ?
    `;

    db.query(findBorrowSql, [borrow_id], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to find borrowing record"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Borrowing record not found"
            });
        }

        if (results[0].status === "returned") {
            return res.status(400).json({
                message: "Book already returned"
            });
        }

        const bookId = results[0].book_id;

        const returnSql = `
            UPDATE borrowing
            SET return_date = CURDATE(),
                status = 'returned'
            WHERE borrow_id = ?
        `;

        db.query(returnSql, [borrow_id], (err) => {
            if (err) {
                return res.status(500).json({
                    message: "Failed to return book"
                });
            }

            const updateBookSql = `
                UPDATE books
                SET available_quantity = available_quantity + 1
                WHERE book_id = ?
            `;

            db.query(updateBookSql, [bookId], (err) => {
                if (err) {
                    return res.status(500).json({
                        message: "Failed to update book quantity"
                    });
                }

                res.json({
                    message: "Book returned successfully"
                });
            });
        });
    });
});

app.post("/api/create-fine", (req, res) => {
    const { borrow_id } = req.body;

    if (!borrow_id) {
        return res.status(400).json({
            message: "Borrow ID is required"
        });
    }

    const sql = `
        SELECT
            borrowing.user_id,
            borrowing.due_date,
            borrowing.return_date,
            borrowing.status
        FROM borrowing
        WHERE borrowing.borrow_id = ?
    `;

    db.query(sql, [borrow_id], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to check borrowing record"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Borrowing record not found"
            });
        }

        const borrowing = results[0];

        const today = new Date();
        const dueDate = new Date(borrowing.due_date);

        const lateDays = Math.max(
            0,
            Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24))
        );

        if (lateDays === 0) {
            return res.json({
                message: "No fine applicable",
                amount: 0
            });
        }

        const fineAmount = lateDays * 5;

        const checkFineSql = `
            SELECT fine_id
            FROM fines
            WHERE borrow_id = ?
        `;

        db.query(checkFineSql, [borrow_id], (err, fines) => {
            if (err) {
                return res.status(500).json({
                    message: "Failed to check existing fine"
                });
            }

            if (fines.length > 0) {
                return res.json({
                    message: "Fine already exists",
                    amount: fineAmount
                });
            }

            const insertFineSql = `
                INSERT INTO fines
                (borrow_id, user_id, amount, status)
                VALUES (?, ?, ?, 'unpaid')
            `;

            db.query(
                insertFineSql,
                [
                    borrow_id,
                    borrowing.user_id,
                    fineAmount
                ],
                (err) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Failed to create fine"
                        });
                    }

                    res.json({
                        message: "Fine created successfully",
                        amount: fineAmount
                    });
                }
            );
        });
    });
});

app.put("/api/reservations/:reservation_id/cancel", (req, res) => {
    const { reservation_id } = req.params;
    const { user_id } = req.body;

    if (!reservation_id || !user_id) {
        return res.status(400).json({
            message: "Reservation ID and User ID are required"
        });
    }

    const sql = `
        UPDATE reservations
        SET status = 'cancelled'
        WHERE reservation_id = ?
        AND user_id = ?
        AND status = 'active'
    `;

    db.query(
        sql,
        [reservation_id, user_id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to cancel reservation"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(400).json({
                    message: "Reservation could not be cancelled"
                });
            }

            res.json({
                message: "Reservation cancelled successfully"
            });
        }
    );
});

// Check overdue books and automatically update fines
app.get("/api/check-overdue/:user_id", (req, res) => {

    const { user_id } = req.params;

    if (!user_id) {
        return res.status(400).json({
            message: "User ID is required"
        });
    }

    const overdueSql = `
        SELECT
            b.borrow_id,
            b.user_id,
            b.book_id,
            b.borrow_date,
            b.due_date,
            b.status
        FROM borrowing b
        WHERE b.user_id = ?
        AND b.status IN ('borrowed', 'overdue')
        AND b.due_date < CURDATE()
    `;

    db.query(
        overdueSql,
        [user_id],
        (err, overdueBooks) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to check overdue books"
                });
            }

            if (overdueBooks.length === 0) {

                return res.json({
                    message: "No overdue books",
                    overdue_count: 0
                });

            }

            let completed = 0;
            let failed = false;

            overdueBooks.forEach((book) => {

                const dueDate = new Date(book.due_date);

                const today = new Date();

                dueDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);

                const difference =
                    today.getTime() -
                    dueDate.getTime();

                const overdueDays =
                    Math.floor(
                        difference /
                        (1000 * 60 * 60 * 24)
                    );

                /*
                    Day 1 overdue = ₹20
                    Day 2 overdue = ₹22
                    Day 3 overdue = ₹24

                    Formula:
                    20 + ((overdueDays - 1) * 2)
                */

                const calculatedFine =
                    20 +
                    ((overdueDays - 1) * 2);

                const updateBorrowingSql = `
                    UPDATE borrowing
                    SET status = 'overdue'
                    WHERE borrow_id = ?
                `;

                db.query(
                    updateBorrowingSql,
                    [book.borrow_id],
                    (err) => {

                        if (err) {
                            failed = true;
                            return;
                        }

                        const fineSql = `
                            SELECT
                                fine_id,
                                amount,
                                status
                            FROM fines
                            WHERE borrow_id = ?
                            LIMIT 1
                        `;

                        db.query(
                            fineSql,
                            [book.borrow_id],
                            (err, fines) => {

                                if (err) {
                                    failed = true;
                                    return;
                                }

                                if (fines.length === 0) {

                                    const insertFineSql = `
                                        INSERT INTO fines
                                        (
                                            borrow_id,
                                            user_id,
                                            amount,
                                            status
                                        )
                                        VALUES (?, ?, ?, 'unpaid')
                                    `;

                                    db.query(
                                        insertFineSql,
                                        [
                                            book.borrow_id,
                                            book.user_id,
                                            calculatedFine
                                        ],
                                        (err) => {

                                            if (err) {
                                                failed = true;
                                            }

                                            completed++;

                                            finish();

                                        }
                                    );

                                } else {

                                    const existingFine =
                                        fines[0];

                                    /*
                                        Only automatically update
                                        unpaid fines.

                                        Paid fines remain unchanged.
                                    */

                                    if (
                                        existingFine.status ===
                                        "unpaid"
                                    ) {

                                        const updateFineSql = `
                                            UPDATE fines
                                            SET amount = ?
                                            WHERE fine_id = ?
                                            AND status = 'unpaid'
                                        `;

                                        db.query(
                                            updateFineSql,
                                            [
                                                calculatedFine,
                                                existingFine.fine_id
                                            ],
                                            (err) => {

                                                if (err) {
                                                    failed = true;
                                                }

                                                completed++;

                                                finish();

                                            }
                                        );

                                    } else {

                                        completed++;

                                        finish();

                                    }

                                }

                            }
                        );

                    }
                );

            });

            function finish() {

                if (completed !== overdueBooks.length) {
                    return;
                }

                if (failed) {

                    return res.status(500).json({
                        message:
                            "Some overdue records could not be updated"
                    });

                }

                res.json({
                    message:
                        "Overdue books and fines updated successfully",

                    overdue_count:
                        overdueBooks.length
                });

            }

        }
    );

});

// ===============================
// ADMIN - BOOK MANAGEMENT
// ===============================

// Get all categories
app.get("/api/categories", (req, res) => {

    const sql = `
        SELECT category_id, category_name
        FROM categories
        ORDER BY category_name
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to fetch categories"
            });
        }

        res.json(results);
    });
});

// Add a new book
app.post("/api/admin/books", (req, res) => {

    const {
        title,
        author,
        isbn,
        publisher,
        publication_year,
        quantity,
        category_id
    } = req.body;

    if (
        !title ||
        !author ||
        !quantity ||
        !category_id
    ) {
        return res.status(400).json({
            message: "Title, author, quantity and category are required"
        });
    }

    const sql = `
        INSERT INTO books
        (
            title,
            author,
            isbn,
            publisher,
            publication_year,
            quantity,
            available_quantity,
            category_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            title,
            author,
            isbn || null,
            publisher || null,
            publication_year || null,
            quantity,
            quantity,
            category_id
        ],
        (err, result) => {

            if (err) {

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({
                        message: "ISBN already exists"
                    });
                }

                return res.status(500).json({
                    message: "Failed to add book"
                });
            }

            res.status(201).json({
                message: "Book added successfully",
                book_id: result.insertId
            });
        }
    );
});

// Update a book
app.put("/api/admin/books/:book_id", (req, res) => {

    const { book_id } = req.params;

    const {
        title,
        author,
        isbn,
        publisher,
        publication_year,
        quantity,
        category_id
    } = req.body;

    if (
        !title ||
        !author ||
        !quantity ||
        !category_id
    ) {
        return res.status(400).json({
            message: "Title, author, quantity and category are required"
        });
    }

    const getBookSql = `
        SELECT quantity, available_quantity
        FROM books
        WHERE book_id = ?
    `;

    db.query(
        getBookSql,
        [book_id],
        (err, books) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to find book"
                });
            }

            if (books.length === 0) {
                return res.status(404).json({
                    message: "Book not found"
                });
            }

            const oldQuantity = books[0].quantity;
            const oldAvailable = books[0].available_quantity;

            const borrowedCopies =
                oldQuantity - oldAvailable;

            if (quantity < borrowedCopies) {
                return res.status(400).json({
                    message:
                        `Quantity cannot be less than ${borrowedCopies} borrowed copies`
                });
            }

            const newAvailable =
                quantity - borrowedCopies;

            const updateSql = `
                UPDATE books
                SET
                    title = ?,
                    author = ?,
                    isbn = ?,
                    publisher = ?,
                    publication_year = ?,
                    quantity = ?,
                    available_quantity = ?,
                    category_id = ?
                WHERE book_id = ?
            `;

            db.query(
                updateSql,
                [
                    title,
                    author,
                    isbn || null,
                    publisher || null,
                    publication_year || null,
                    quantity,
                    newAvailable,
                    category_id,
                    book_id
                ],
                (err) => {

                    if (err) {

                        if (err.code === "ER_DUP_ENTRY") {
                            return res.status(400).json({
                                message: "ISBN already exists"
                            });
                        }

                        return res.status(500).json({
                            message: "Failed to update book"
                        });
                    }

                    res.json({
                        message: "Book updated successfully"
                    });
                }
            );
        }
    );
});

// Delete a book
app.delete("/api/admin/books/:book_id", (req, res) => {

    const { book_id } = req.params;

    const checkBorrowingSql = `
        SELECT borrow_id
        FROM borrowing
        WHERE book_id = ?
        LIMIT 1
    `;

    db.query(
        checkBorrowingSql,
        [book_id],
        (err, borrowing) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to check borrowing records"
                });
            }

            if (borrowing.length > 0) {
                return res.status(400).json({
                    message:
                        "This book cannot be deleted because it has borrowing history"
                });
            }

            const deleteSql = `
                DELETE FROM books
                WHERE book_id = ?
            `;

            db.query(
                deleteSql,
                [book_id],
                (err, result) => {

                    if (err) {
                        return res.status(500).json({
                            message: "Failed to delete book"
                        });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({
                            message: "Book not found"
                        });
                    }

                    res.json({
                        message: "Book deleted successfully"
                    });
                }
            );
        }
    );
});

// ===============================
// ADMIN - CATEGORY MANAGEMENT
// ===============================

// Add a new category
app.post("/api/admin/categories", (req, res) => {

    const { category_name } = req.body;

    if (!category_name || !category_name.trim()) {
        return res.status(400).json({
            message: "Category name is required"
        });
    }

    const cleanName = category_name.trim();

    const sql = `
        INSERT INTO categories (category_name)
        VALUES (?)
    `;

    db.query(
        sql,
        [cleanName],
        (err, result) => {

            if (err) {

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({
                        message: "Category already exists"
                    });
                }

                return res.status(500).json({
                    message: "Failed to add category"
                });
            }

            res.status(201).json({
                message: "Category added successfully",
                category_id: result.insertId,
                category_name: cleanName
            });
        }
    );
});

// ===============================
// ADMIN - STUDENT MANAGEMENT
// ===============================

// Admin authentication middleware

const requireAdmin = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {

        return res.status(401).json({
            message: "Authentication required"
        });

    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(
            token,
            JWT_SECRET
        );

        if (decoded.role !== "admin") {

            return res.status(403).json({
                message: "Admin access required"
            });

        }

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired token"
        });

    }

};

app.use("/api/admin", requireAdmin);

// Get all students
app.get("/api/admin/students", (req, res) => {

    const sql = `
        SELECT
            u.user_id,
            u.name,
            u.email,
            u.created_at,

            (
                SELECT COUNT(*)
                FROM borrowing b
                WHERE b.user_id = u.user_id
                AND b.status IN ('borrowed', 'overdue')
            ) AS borrowed_count,

            (
                SELECT COUNT(*)
                FROM reservations r
                WHERE r.user_id = u.user_id
                AND r.status = 'active'
            ) AS reservation_count,

            (
                SELECT COALESCE(SUM(f.amount), 0)
                FROM fines f
                WHERE f.user_id = u.user_id
                AND f.status = 'unpaid'
            ) AS unpaid_fines

        FROM users u

        WHERE u.role = 'student'

        ORDER BY u.created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to fetch students"
            });
        }

        res.json(results);
    });
});

// ===============================
// ADMIN - BORROWING MANAGEMENT
// ===============================

// Get all borrowing records
app.get("/api/admin/borrowing", (req, res) => {

    const sql = `
        SELECT
            borrowing.borrow_id,
            borrowing.borrow_date,
            borrowing.due_date,
            borrowing.return_date,
            borrowing.status,

            users.user_id,
            users.name AS student_name,
            users.email AS student_email,

            books.book_id,
            books.title AS book_title,
            books.author AS book_author

        FROM borrowing

        JOIN users
        ON borrowing.user_id = users.user_id

        JOIN books
        ON borrowing.book_id = books.book_id

        ORDER BY borrowing.borrow_date DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to fetch borrowing records"
            });
        }

        res.json(results);
    });
});

// Update borrowing due date
app.put("/api/admin/borrowing/:borrow_id/due-date", (req, res) => {

    const { borrow_id } = req.params;
    const { due_date } = req.body;

    if (!borrow_id || !due_date) {
        return res.status(400).json({
            message: "Borrow ID and due date are required"
        });
    }

    const checkSql = `
        SELECT
            borrow_id,
            borrow_date,
            return_date,
            status
        FROM borrowing
        WHERE borrow_id = ?
    `;

    db.query(checkSql, [borrow_id], (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to find borrowing record"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Borrowing record not found"
            });
        }

        const borrowing = results[0];

        if (borrowing.status === "returned") {
            return res.status(400).json({
                message: "Due date cannot be changed for a returned book"
            });
        }

        const borrowDate = new Date(borrowing.borrow_date);
        const newDueDate = new Date(due_date);

        if (isNaN(newDueDate.getTime())) {
            return res.status(400).json({
                message: "Invalid due date"
            });
        }

        if (newDueDate < borrowDate) {
            return res.status(400).json({
                message: "Due date cannot be before the borrow date"
            });
        }

        const updateSql = `
            UPDATE borrowing
            SET
                due_date = ?,
                status = CASE
                    WHEN ? < CURDATE() THEN 'overdue'
                    ELSE 'borrowed'
                END
            WHERE borrow_id = ?
        `;

        db.query(
            updateSql,
            [due_date, due_date, borrow_id],
            (err, result) => {

                if (err) {
                    return res.status(500).json({
                        message: "Failed to update due date"
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(400).json({
                        message: "Due date could not be updated"
                    });
                }

                res.json({
                    message: "Due date updated successfully"
                });

            }
        );

    });

});

// Extend borrowing period
app.put("/api/borrowing/:borrow_id/extend", (req, res) => {

    const { borrow_id } = req.params;
    const { user_id } = req.body;

    if (!borrow_id || !user_id) {
        return res.status(400).json({
            message: "Borrow ID and user ID are required"
        });
    }

    const findBorrowingSql = `
        SELECT
            borrow_id,
            user_id,
            book_id,
            borrow_date,
            due_date,
            return_date,
            status
        FROM borrowing
        WHERE borrow_id = ?
        AND user_id = ?
    `;

    db.query(
        findBorrowingSql,
        [borrow_id, user_id],
        (err, results) => {

            if (err) {

                return res.status(500).json({
                    message: "Failed to find borrowing record"
                });

            }

            if (results.length === 0) {

                return res.status(404).json({
                    message: "Borrowing record not found"
                });

            }

            const borrowing = results[0];

            // Cannot extend a returned book
            if (borrowing.status === "returned") {

                return res.status(400).json({
                    message: "Returned books cannot be extended"
                });

            }

            // Cannot extend an already overdue book
            if (borrowing.status === "overdue") {

                return res.status(400).json({
                    message: "Overdue books cannot be extended"
                });

            }

            // Check whether another student has reserved this book
            const reservationSql = `
                SELECT reservation_id
                FROM reservations
                WHERE book_id = ?
                AND status = 'active'
                AND user_id != ?
                LIMIT 1
            `;

            db.query(
                reservationSql,
                [
                    borrowing.book_id,
                    user_id
                ],
                (err, reservations) => {

                    if (err) {

                        return res.status(500).json({
                            message: "Failed to check reservations"
                        });

                    }

                    if (reservations.length > 0) {

                        return res.status(400).json({
                            message:
                                "This book has been reserved by another student and cannot be extended"
                        });

                    }

                    // Extend by 7 days
                    const updateSql = `
                        UPDATE borrowing
                        SET due_date = DATE_ADD(due_date, INTERVAL 7 DAY)
                        WHERE borrow_id = ?
                        AND user_id = ?
                        AND status = 'borrowed'
                    `;

                    db.query(
                        updateSql,
                        [
                            borrow_id,
                            user_id
                        ],
                        (err, result) => {

                            if (err) {

                                return res.status(500).json({
                                    message:
                                        "Failed to extend borrowing period"
                                });

                            }

                            if (result.affectedRows === 0) {

                                return res.status(400).json({
                                    message:
                                        "Borrowing period could not be extended"
                                });

                            }

                            const newDueDateSql = `
                                SELECT due_date
                                FROM borrowing
                                WHERE borrow_id = ?
                            `;

                            db.query(
                                newDueDateSql,
                                [borrow_id],
                                (err, updatedResults) => {

                                    if (err) {

                                        return res.status(500).json({
                                            message:
                                                "Borrowing was extended but the new due date could not be retrieved"
                                        });

                                    }

                                    res.json({
                                        message:
                                            "Borrowing period extended successfully",

                                        new_due_date:
                                            updatedResults[0].due_date
                                    });

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});

// ===============================
// ADMIN - RESERVATION MANAGEMENT
// ===============================

app.get("/api/admin/reservations", (req, res) => {

    const sql = `
        SELECT
            reservations.reservation_id,
            reservations.reservation_date,
            reservations.status,

            users.user_id,
            users.name AS student_name,
            users.email AS student_email,

            books.book_id,
            books.title AS book_title,
            books.author AS book_author,
            books.available_quantity

        FROM reservations

        JOIN users
        ON reservations.user_id = users.user_id

        JOIN books
        ON reservations.book_id = books.book_id

        ORDER BY reservations.reservation_date DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to fetch reservations"
            });
        }

        res.json(results);
    });
});

// ===============================
// ADMIN - FINE MANAGEMENT
// ===============================

app.get("/api/admin/fines", (req, res) => {

    const sql = `
        SELECT
            fines.fine_id,
            fines.borrow_id,
            fines.amount,
            fines.status,
            fines.created_at,

            users.user_id,
            users.name AS student_name,
            users.email AS student_email,

            books.book_id,
            books.title AS book_title,
            books.author AS book_author

        FROM fines

        JOIN users
        ON fines.user_id = users.user_id

        JOIN borrowing
        ON fines.borrow_id = borrowing.borrow_id

        JOIN books
        ON borrowing.book_id = books.book_id

        ORDER BY fines.created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to fetch fines"
            });
        }

        res.json(results);
    });
});

// Admin Reports

app.get("/api/admin/reports", (req, res) => {

    const sql = `
        SELECT

            (
                SELECT COUNT(*)
                FROM books
            ) AS total_books,

            (
                SELECT COUNT(*)
                FROM users
                WHERE role = 'student'
            ) AS total_students,

            (
                SELECT COUNT(*)
                FROM borrowing
            ) AS total_borrowings,

            (
                SELECT COUNT(*)
                FROM borrowing
                WHERE status = 'borrowed'
            ) AS active_borrowings,

            (
                SELECT COUNT(*)
                FROM borrowing
                WHERE status = 'overdue'
            ) AS overdue_books,

            (
                SELECT COUNT(*)
                FROM reservations
                WHERE status = 'active'
            ) AS active_reservations,

            (
                SELECT COALESCE(SUM(amount), 0)
                FROM fines
            ) AS total_fines,

            (
                SELECT COALESCE(SUM(amount), 0)
                FROM fines
                WHERE status = 'unpaid'
            ) AS unpaid_fines
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "Reports error:",
                err
            );

            return res.status(500).json({
                message: "Failed to generate reports"
            });

        }

        res.json(results[0]);

    });

});

// Admin Dashboard Statistics

app.get("/api/admin/dashboard-stats", (req, res) => {

    const sql = `
        SELECT

            (SELECT COUNT(*)
             FROM books) AS total_books,

            (SELECT COUNT(*)
             FROM users
             WHERE role = 'student') AS total_students,

            (SELECT COUNT(*)
             FROM borrowing
             WHERE status = 'borrowed') AS currently_borrowed,

            (SELECT COUNT(*)
             FROM borrowing
             WHERE status = 'overdue') AS overdue_books,

            (SELECT COUNT(*)
             FROM reservations
             WHERE status = 'active') AS active_reservations,

            (SELECT COALESCE(SUM(amount), 0)
             FROM fines
             WHERE status = 'unpaid') AS unpaid_fines
    `;

    db.query(sql, (err, results) => {

        if (err) {

            return res.status(500).json({
                message: "Failed to fetch dashboard statistics"
            });

        }

        res.json(results[0]);

    });

});

// Mark fine as paid

app.put("/api/admin/fines/:fine_id/pay", (req, res) => {

    const { fine_id } = req.params;

    const sql = `
        UPDATE fines
        SET status = 'paid'
        WHERE fine_id = ?
        AND status = 'unpaid'
    `;

    db.query(sql, [fine_id], (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to update fine"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: "Fine is already paid or does not exist"
            });
        }

        res.json({
            message: "Fine marked as paid successfully"
        });

    });

});

// Update fine amount
app.put("/api/admin/fines/:fine_id/amount", (req, res) => {

    const { fine_id } = req.params;
    const { amount } = req.body;

    if (!fine_id || amount === undefined || amount === null || amount === "") {
        return res.status(400).json({
            message: "Fine ID and amount are required"
        });
    }

    const numericAmount = Number(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
            message: "Fine amount must be greater than 0"
        });
    }

    const checkSql = `
        SELECT
            fine_id,
            amount,
            status
        FROM fines
        WHERE fine_id = ?
    `;

    db.query(checkSql, [fine_id], (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to find fine"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Fine not found"
            });
        }

        const fine = results[0];

        if (fine.status === "paid") {
            return res.status(400).json({
                message: "Paid fine amount cannot be changed"
            });
        }

        const updateSql = `
            UPDATE fines
            SET amount = ?
            WHERE fine_id = ?
            AND status = 'unpaid'
        `;

        db.query(
            updateSql,
            [numericAmount, fine_id],
            (err, result) => {

                if (err) {
                    return res.status(500).json({
                        message: "Failed to update fine amount"
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(400).json({
                        message: "Fine amount could not be updated"
                    });
                }

                res.json({
                    message: "Fine amount updated successfully"
                });

            }
        );

    });

});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});

app.post("/api/register", async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: "Password must be at least 6 characters"
        });
    }

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users
            (name, email, password)
            VALUES (?, ?, ?)
        `;

        db.query(
            sql,
            [name, email, hashedPassword],
            (err, result) => {

                if (err) {

                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(400).json({
                            message: "Email already registered"
                        });
                    }

                    return res.status(500).json({
                        message: "Registration failed"
                    });
                }

                res.status(201).json({
                    message: "Registration successful",
                    user_id: result.insertId
                });

            }
        );

    } catch (error) {

        res.status(500).json({
            message: "Registration failed"
        });

    }

});

app.post("/api/login", async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const sql = `
        SELECT
            user_id,
            name,
            email,
            password,
            role
        FROM users
        WHERE email = ?
    `;

    db.query(sql, [email], async (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Login failed"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = results[0];

        try {

            let passwordValid = false;

            if (
                user.password.startsWith("$2a$") ||
                user.password.startsWith("$2b$") ||
                user.password.startsWith("$2y$")
            ) {

                passwordValid = await bcrypt.compare(
                    password,
                    user.password
                );

            } else {

                passwordValid = password === user.password;

                if (passwordValid) {

                    const hashedPassword =
                        await bcrypt.hash(password, 10);

                    const updateSql = `
                        UPDATE users
                        SET password = ?
                        WHERE user_id = ?
                    `;

                    db.query(
                        updateSql,
                        [
                            hashedPassword,
                            user.user_id
                        ]
                    );
                }
            }

            if (!passwordValid) {

                return res.status(401).json({
                    message: "Invalid email or password"
                });

            }

            const token = jwt.sign(
                {
                    user_id: user.user_id,
                    role: user.role
                },
                JWT_SECRET,
                {
                    expiresIn: "2h"
                }
            );

            res.json({

                message: "Login successful",

                token: token,

                user: {
                    user_id: user.user_id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message: "Login failed"
            });

        }

    });

});
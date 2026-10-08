import { useEffect } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import BookSearch from "./pages/BookSearch";
import BorrowBook from "./pages/BorrowBook";
import MyBorrowedBooks from "./pages/MyBorrowedBooks";
import MyReservations from "./pages/MyReservations";
import ReserveBook from "./pages/ReserveBook";
import MyFines from "./pages/MyFines";
import ReturnBook from "./pages/ReturnBook";
import BookDetails from "./pages/BookDetails";
import Account from "./pages/Account";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBooks from "./pages/AdminBooks";
import AdminAddBook from "./pages/AdminAddBook";
import AdminEditBook from "./pages/AdminEditBook";
import AdminStudents from "./pages/AdminStudents";
import AdminBorrowing from "./pages/AdminBorrowing";
import AdminReservations from "./pages/AdminReservations";
import AdminFines from "./pages/AdminFines";
import AdminReports from "./pages/AdminReports";

function App() {
  useEffect(() => {

  const token = localStorage.getItem("token");

  if (token) {
    axios.defaults.headers.common["Authorization"] =
      `Bearer ${token}`;
  }

}, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/books" element={<BookSearch />} />
        <Route path="/borrow" element={<BorrowBook />} />
        <Route
          path="/my-borrowed-books"
          element={<MyBorrowedBooks />}
        />
        <Route
  path="/my-reservations"
  element={<MyReservations />}
/>
<Route path="/reserve" element={<ReserveBook />} />
<Route path="/my-fines" element={<MyFines />} />
<Route path="/return-book" element={<ReturnBook />} />
<Route
  path="/book/:bookId"
  element={<BookDetails />}
/>
<Route path="/account" element={<Account />} />
<Route path="/admin" element={<AdminDashboard />} />
<Route
  path="/admin/books"
  element={<AdminBooks />}
/>
<Route
  path="/admin/books/add"
  element={<AdminAddBook />}
/>
<Route
  path="/admin/books/edit/:bookId"
  element={<AdminEditBook />}
/>
<Route
  path="/admin/students"
  element={<AdminStudents />}
/>
<Route
  path="/admin/borrowing"
  element={<AdminBorrowing />}
/>
<Route
  path="/admin/reservations"
  element={<AdminReservations />}
/>
<Route
  path="/admin/fines"
  element={<AdminFines />}
/>
<Route path="/admin/reports" element={<AdminReports />} />

      </Routes>
    </BrowserRouter>
    
  );
}

export default App;
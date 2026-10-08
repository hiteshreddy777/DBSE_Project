import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    delete axios.defaults.headers.common["Authorization"];

    navigate("/login");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="student-navbar">

      <div className="student-navbar-inner">

        {/* BRAND */}

        <NavLink
          to="/dashboard"
          className="student-navbar-brand"
          onClick={closeMenu}
        >
          <div className="student-navbar-logo">
            S
          </div>

          <div className="student-navbar-brand-text">
            <strong>SmartLibrary</strong>
            <span>DIGITAL LIBRARY</span>
          </div>
        </NavLink>


        {/* MOBILE MENU BUTTON */}

        <button
          className="student-navbar-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>


        {/* NAVIGATION */}

        <nav
          className={
            menuOpen
              ? "student-navbar-links open"
              : "student-navbar-links"
          }
        >

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? "student-nav-link active"
                : "student-nav-link"
            }
            onClick={closeMenu}
          >
            <span>⌂</span>
            Dashboard
          </NavLink>


          <NavLink
            to="/books"
            className={({ isActive }) =>
              isActive
                ? "student-nav-link active"
                : "student-nav-link"
            }
            onClick={closeMenu}
          >
            <span>📚</span>
            Browse Books
          </NavLink>


          <NavLink
            to="/my-borrowed-books"
            className={({ isActive }) =>
              isActive
                ? "student-nav-link active"
                : "student-nav-link"
            }
            onClick={closeMenu}
          >
            <span>📖</span>
            My Library
          </NavLink>


          <NavLink
            to="/my-reservations"
            className={({ isActive }) =>
              isActive
                ? "student-nav-link active"
                : "student-nav-link"
            }
            onClick={closeMenu}
          >
            <span>🔖</span>
            Reservations
          </NavLink>


          <NavLink
            to="/my-fines"
            className={({ isActive }) =>
              isActive
                ? "student-nav-link active"
                : "student-nav-link"
            }
            onClick={closeMenu}
          >
            <span>₹</span>
            Fines
          </NavLink>

        </nav>


        {/* ACCOUNT */}

        <div className="student-navbar-account">

          <button
            className="student-navbar-profile"
            onClick={() => navigate("/account")}
          >
            <div className="student-navbar-avatar">
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : "U"}
            </div>

            <div className="student-navbar-user">
              <strong>
                {user?.name || "Student"}
              </strong>

              <span>
                Student Account
              </span>
            </div>
          </button>


          <button
            className="student-navbar-logout"
            onClick={handleLogout}
            title="Logout"
          >
            ↪
          </button>

        </div>

      </div>

    </header>
  );
}

export default Navbar;
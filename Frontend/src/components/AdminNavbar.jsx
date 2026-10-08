import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

function AdminNavbar() {
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
    <header className="admin-navbar">

      <div className="admin-navbar-inner">

        {/* BRAND */}

        <NavLink
          to="/admin"
          className="admin-navbar-brand"
          onClick={closeMenu}
        >
          <div className="admin-navbar-logo">
            S
          </div>

          <div className="admin-navbar-brand-text">
            <strong>SmartLibrary</strong>
            <span>ADMIN PORTAL</span>
          </div>
        </NavLink>


        {/* MOBILE MENU */}

        <button
          className="admin-navbar-menu"
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
              ? "admin-navbar-links open"
              : "admin-navbar-links"
          }
        >

          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive
                ? "admin-nav-link active"
                : "admin-nav-link"
            }
            onClick={closeMenu}
          >
            <span>⌂</span>
            Dashboard
          </NavLink>


          <NavLink
            to="/admin/books"
            className={({ isActive }) =>
              isActive
                ? "admin-nav-link active"
                : "admin-nav-link"
            }
            onClick={closeMenu}
          >
            <span>📚</span>
            Books
          </NavLink>


          <NavLink
            to="/admin/students"
            className={({ isActive }) =>
              isActive
                ? "admin-nav-link active"
                : "admin-nav-link"
            }
            onClick={closeMenu}
          >
            <span>👥</span>
            Students
          </NavLink>


          <NavLink
            to="/admin/borrowing"
            className={({ isActive }) =>
              isActive
                ? "admin-nav-link active"
                : "admin-nav-link"
            }
            onClick={closeMenu}
          >
            <span>📖</span>
            Borrowing
          </NavLink>


          <NavLink
            to="/admin/reservations"
            className={({ isActive }) =>
              isActive
                ? "admin-nav-link active"
                : "admin-nav-link"
            }
            onClick={closeMenu}
          >
            <span>🔖</span>
            Reservations
          </NavLink>


          <NavLink
            to="/admin/fines"
            className={({ isActive }) =>
              isActive
                ? "admin-nav-link active"
                : "admin-nav-link"
            }
            onClick={closeMenu}
          >
            <span>₹</span>
            Fines
          </NavLink>


          <NavLink
            to="/admin/reports"
            className={({ isActive }) =>
              isActive
                ? "admin-nav-link active"
                : "admin-nav-link"
            }
            onClick={closeMenu}
          >
            <span>📊</span>
            Reports
          </NavLink>

        </nav>


        {/* ADMIN PROFILE */}

        <div className="admin-navbar-account">

          <div className="admin-navbar-profile">

            <div className="admin-navbar-avatar">
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : "A"}
            </div>

            <div className="admin-navbar-user">

              <strong>
                {user?.name || "Library Admin"}
              </strong>

              <span>
                Administrator
              </span>

            </div>

          </div>


          <button
            className="admin-navbar-logout"
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

export default AdminNavbar;
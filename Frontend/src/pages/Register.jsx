import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/register",
        {
          name,
          email,
          password
        }
      );

      alert(response.data.message);

      setName("");
      setEmail("");
      setPassword("");

      navigate("/login");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Registration failed"
      );
    }
  };

  return (
    <div className="register-page">

      <div className="register-card">

        {/* Logo / Branding */}
        <div className="register-brand">
          <div className="register-brand-icon">S</div>

          <div>
            <h1>SmartLibrary</h1>
            <span>DIGITAL LIBRARY</span>
          </div>
        </div>

        {/* Heading */}
        <div className="register-heading">
          <span className="register-label">GET STARTED</span>

          <h2>Create your account</h2>

          <p>
            Join SmartLibrary and manage your library
            experience in one place.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister}>

          <div className="register-field">
            <label>Full Name</label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="register-field">
            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="register-field">
            <label>Password</label>

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <small>
              Password must be at least 6 characters.
            </small>
          </div>

          <button
            className="register-submit"
            type="submit"
          >
            Create Account
            <span>→</span>
          </button>

        </form>

        {/* Login link */}
        <div className="register-divider">
          <span>ALREADY A MEMBER?</span>
        </div>

        <button
          className="register-login"
          onClick={() => navigate("/login")}
        >
          Sign in to your account
        </button>

        <p className="register-footer">
          SmartLibrary • Digital Library Management System
        </p>

      </div>

    </div>
  );
}

export default Register;
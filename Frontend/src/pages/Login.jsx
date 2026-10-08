import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");

        if (!email || !password) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                "http://localhost:5000/api/login",
                {
                    email,
                    password
                }
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            localStorage.setItem(
                "token",
                response.data.token
            );

            axios.defaults.headers.common["Authorization"] =
                `Bearer ${response.data.token}`;

            if (response.data.user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                {/* Brand */}
                <div className="login-brand">
                    <div className="login-brand-icon">S</div>

                    <div>
                        <h1>SmartLibrary</h1>
                        <span>DIGITAL LIBRARY</span>
                    </div>
                </div>

                {/* Heading */}
                <div className="login-heading">
                    <span className="login-label">
                        WELCOME BACK
                    </span>

                    <h2>Sign in to your library</h2>

                    <p>
                        Access your books, borrowing activity,
                        reservations and more.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin}>

                    <div className="login-field">
                        <label>Email Address</label>

                        <input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />
                    </div>

                    <div className="login-field">
                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign In →"}
                    </button>

                </form>

                {/* Register */}
                <div className="login-divider">
                    <span>NEW TO SMARTLIBRARY?</span>
                </div>

                <button
                    className="login-register"
                    onClick={() => navigate("/register")}
                >
                    Create an account
                </button>

                <p className="login-footer">
                    SmartLibrary • Digital Library Management System
                </p>

            </div>

        </div>
    );
}

export default Login;
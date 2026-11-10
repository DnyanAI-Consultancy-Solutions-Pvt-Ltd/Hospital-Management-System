import companyLogo from "../assets/company-logo.PNG";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

const handleLogin = async (e) => {
  e.preventDefault();

  setError("");
  setLoading(true);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      }
    );

    const text = await response.text();

    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
        text ||
        "Invalid username or password"
      );
    }

    // Read role and token from common login response formats
    const userData = data.user || data.data?.user || data.data || data;

    const role = String(
      data.role ||
      data.user?.role ||
      data.data?.role ||
      data.data?.user?.role ||
      data.userRole ||
      userData.role ||
      ""
    ).trim().toUpperCase().replace(/^ROLE_/, "");

    const token =
      data.token ||
      data.jwtToken ||
      data.accessToken ||
      data.data?.token ||
      data.data?.jwtToken ||
      data.data?.accessToken;

    if (!["ADMIN", "DOCTOR", "RECEPTIONIST"].includes(role)) {
      setError("User role not found or not authorized.");
      return;
    }

    // Save normalized user details
    localStorage.setItem(
      "user",
      JSON.stringify({
        ...userData,
        role,
        username: userData.username || username,
        fullName: userData.fullName || userData.name || username
      })
    );

    if (token) {
      localStorage.setItem("token", token);
    }

    if (role === "DOCTOR") {
      navigate("/doctor-module", { replace: true });
    } else {
      // Admin and Receptionist both open the dashboard
      navigate("/", { replace: true });
    }

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">
  <img
    src={companyLogo}
    alt="Company Logo"
    className="company-logo"
  />
</div>

        <h2>Hospital Management System</h2>
        <p>Login to continue</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Username</label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            className="save-btn login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
<button
  type="button"
  onClick={() => navigate("/signup")}
  className="link-btn"
>
  Create New Account
</button>
        </form>

      </div>
    </div>
  );
}

export default Login;
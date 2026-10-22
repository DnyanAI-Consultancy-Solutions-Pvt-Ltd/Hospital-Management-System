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

    // Save login response for later use
    localStorage.setItem(
      "user",
      JSON.stringify(data)
    );

    // Get role from login response
const role = String(
  data.role ||
  data.user?.role ||
  data.userRole ||
  ""
).toUpperCase();

if (role === "DOCTOR") {
  navigate("/doctor-module", { replace: true });
} else if (role === "ADMIN") {
  navigate("/", { replace: true });
} else {
  setError("User role not found or not authorized.");
  localStorage.removeItem("user");
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
          🏥
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
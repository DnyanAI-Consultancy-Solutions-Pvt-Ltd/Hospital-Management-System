import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_BASE_URL from "../services/api";

function Signup() {
  const navigate = useNavigate();
  const location = useLocation();

  const fromUsers = location.state?.fromUsers === true;

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(fromUsers && token
            ? { Authorization: `Bearer ${token}` }
            : {})
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || "Account creation failed"
        );
      }

      setSuccess("Account created successfully!");

      setFormData({
        fullName: "",
        username: "",
        email: "",
        password: "",
        role: ""
      });

      setTimeout(() => {
        if (fromUsers) {
          navigate("/users", { replace: true });
        } else {
          navigate("/login");
        }
      }, 1200);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
<div className="login-card signup-card">
        {fromUsers && (
          <button
            type="button"
            className="signup-back-btn"
            onClick={() => navigate("/users", { replace: true })}
          >
            ← Back to Users
          </button>
        )}

        <div className="login-logo">
          🏥
        </div>

        <h2>Create Account</h2>

        <p>Hospital Management System</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <form onSubmit={handleSignup}>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select Role</option>
              <option value="DOCTOR">Doctor</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="NURSE">Nurse</option>
              <option value="LAB_TECHNICIAN">Lab Technician</option>
              <option value="PHARMACIST">Pharmacist</option>
              <option value="ACCOUNTANT">Accountant</option>
            </select>
          </div>

          <button
            type="submit"
            className="save-btn login-btn"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        {!fromUsers && (
          <div style={{ marginTop: "15px" }}>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="link-btn"
            >
              Already have an account? Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default Signup;
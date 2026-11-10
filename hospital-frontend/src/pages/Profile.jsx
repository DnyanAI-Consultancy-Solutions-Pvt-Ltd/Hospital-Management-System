
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/api";

function Profile() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/users/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Password update failed."
        );
      }

      setMessage("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setShowPasswordModal(false);
        setMessage("");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
<div id="profile-page" className="profile-page">      
  <div className="profile-header">
        <button className="profile-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div>
          <h2>My Profile</h2>
          <p>Manage your personal account information</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          {(user.fullName || "U").charAt(0).toUpperCase()}
        </div>

        <h3>{user.fullName || "User"}</h3>
        <span className="profile-role">
          {user.role || user.userRole || "N/A"}
        </span>

        <div className="profile-details">
          <div className="profile-field">
            <label>Full Name</label>
            <p>{user.fullName || "N/A"}</p>
          </div>

          <div className="profile-field">
            <label>Username</label>
            <p>{user.username || "N/A"}</p>
          </div>

          <div className="profile-field">
            <label>Email Address</label>
            <p>{user.email || "N/A"}</p>
          </div>

          <div className="profile-field">
            <label>Role</label>
            <p>{user.role || user.userRole || "N/A"}</p>
          </div>
        </div>

        <div className="profile-password-section">
          <div>
            <h4>Password</h4>
            <p>Update your account password securely.</p>
          </div>

          <button
            className="forgot-password-btn"
            onClick={() => {
              setError("");
              setMessage("");
              setShowPasswordModal(true);
            }}
          >
            Change Password
          </button>
        </div>
      </div>

      {showPasswordModal && (
        <div
          className="password-modal-overlay"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="password-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setShowPasswordModal(false)}
            >
              ×
            </button>

            <h2>Change Password</h2>
            <p>Enter your current password and choose a new password.</p>

            {error && <div className="profile-error">{error}</div>}
            {message && <div className="profile-success">{message}</div>}

            <form onSubmit={handlePasswordChange}>
              <div className="password-input-group">
                <label>Old Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter old password"
                  required
                />
              </div>

              <div className="password-input-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  minLength={8}
                  required
                />
              </div>

              <div className="password-input-group">
                <label>Re-enter New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <div className="password-modal-actions">
                <button
                  type="button"
                  className="cancel-password-btn"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="update-password-btn"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;

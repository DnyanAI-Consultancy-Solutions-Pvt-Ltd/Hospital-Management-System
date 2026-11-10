import { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../services/api";
import { useNavigate } from "react-router-dom";
function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          response.status === 403
            ? "Access denied. Admin access is required."
            : `Failed to load users (${response.status})`
        );
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (user) => {
    const newStatus = !user.active;

    const confirmed = window.confirm(
      `Are you sure you want to ${newStatus ? "enable" : "disable"} ${user.fullName}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(user.id);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/users/${user.id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ active: newStatus }),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Status update failed.");
      }

      const updatedUser = await response.json();

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item.id === updatedUser.id ? updatedUser : item
        )
      );
    } catch (err) {
      setError(err.message || "Unable to update account status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        (user.fullName || "").toLowerCase().includes(searchText) ||
        (user.username || "").toLowerCase().includes(searchText) ||
        (user.email || "").toLowerCase().includes(searchText);

      const matchesRole =
        roleFilter === "ALL" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const activeCount = users.filter((user) => user.active).length;
  const inactiveCount = users.length - activeCount;

  return (
    <div className="page-content users-page">
      <div className="users-heading">
        <div>
          <h2>Users Management</h2>
          <p className="page-subtitle">
            Manage all hospital accounts and access status.
          </p>
        </div>
          <div className="users-heading-actions">

    <button
      className="users-back-btn"
      onClick={() => navigate(-1)}
    >
      ← Back
    </button>
   <button
  className="create-account-btn"
  onClick={() =>
    navigate("/signup", { state: { fromUsers: true } })
  }
>
  + Create Account
</button>
        <button
          className="users-refresh-btn"
          onClick={fetchUsers}
          disabled={loading}
        >
          ↻ Refresh
        </button>
        </div>
      </div>

      <div className="users-stats">
        <div className="users-stat-card">
          <span>Total Accounts</span>
          <h3>{users.length}</h3>
        </div>

        <div className="users-stat-card">
          <span>Active Accounts</span>
          <h3>{activeCount}</h3>
        </div>

        <div className="users-stat-card">
          <span>Deactive Accounts</span>
          <h3>{inactiveCount}</h3>
        </div>
      </div>

      {error && (
        <div className="users-error">
          {error}
        </div>
      )}

      <div className="users-table-card">
        <div className="users-toolbar">
          <input
            type="text"
            placeholder="Search name, username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="DOCTOR">Doctor</option>
            <option value="RECEPTIONIST">Receptionist</option>
            <option value="NURSE">Nurse</option>
            <option value="LAB_TECHNICIAN">Lab Technician</option>
            <option value="PHARMACIST">Pharmacist</option>
            <option value="ACCOUNTANT">Accountant</option>
          </select>
        </div>

        {loading ? (
          <div className="users-message">Loading accounts...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="users-message">No accounts found.</div>
        ) : (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>USERNAME</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="users-name-cell">
                        <div className="users-avatar">
                          {(user.fullName || "U").charAt(0).toUpperCase()}
                        </div>
                        <strong>{user.fullName}</strong>
                      </div>
                    </td>

                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="users-role">
                        {(user.role || "").replaceAll("_", " ")}
                      </span>
                    </td>

                  

<td>
  <label className="user-toggle">
    <input
      type="checkbox"
      checked={user.active}
      onChange={() => handleStatusChange(user)}
      disabled={updatingId === user.id}
    />

    <span className="user-toggle-slider"></span>
  </label>

  <span className="toggle-label">
    {updatingId === user.id
      ? "Updating..."
      : user.active
      ? "Enabled"
      : "Disabled"}
  </span>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (
          <div className="users-footer">
            Showing {filteredUsers.length} of {users.length} accounts
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;
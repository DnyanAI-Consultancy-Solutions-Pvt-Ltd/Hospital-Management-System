
import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const role = String(
    user?.role || user?.user?.role || user?.userRole || ""
  ).toUpperCase();

  const isAdmin = role === "ADMIN";
  const isReceptionist = role === "RECEPTIONIST";
  const isDoctor = role === "DOCTOR";

  const adminMenuItems = [
    { label: "Dashboard", icon: "▦", path: "/" },
    { label: "Patient List", icon: "♙", path: "/patients" },
    { label: "Patient Registration", icon: "＋", path: "/patients/register" },
    { label: "Doctors", icon: "⚕", path: "/doctors" },
    { label: "Appointments", icon: "▣", path: "/appointments" },
    { label: "Doctor Module", icon: "▤", path: "/doctor-module" },
  ];

  const receptionistMenuItems = [
    { label: "Dashboard", icon: "▦", path: "/" },
    { label: "Patient List", icon: "♙", path: "/patients" },
    { label: "Patient Registration", icon: "＋", path: "/patients/register" },
    { label: "Appointments", icon: "▣", path: "/appointments" },
  ];

  const doctorMenuItems = [
    { label: "Doctor Module", icon: "⚕", path: "/doctor-module" },
  ];

  const menuItems = isAdmin
    ? adminMenuItems
    : isDoctor
    ? doctorMenuItems
    : isReceptionist
    ? receptionistMenuItems
    : [];

  const themeClass = isReceptionist
    ? "sidebar-reception"
    : isDoctor
    ? "sidebar-doctor"
    : "sidebar-admin";

  const roleLabel = isAdmin
    ? "Administrator"
    : isReceptionist
    ? "Reception"
    : isDoctor
    ? "Doctor"
    : "Staff";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("jwtToken");
    navigate("/login", { replace: true });
  };

  return (
    <aside className={`sidebar ${themeClass}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">M</div>
        <div className="sidebar-brand-text">
          <h2>DnyanCare</h2>
          <span>Hospital Management</span>
        </div>
      </div>

      <div className="sidebar-section-label">WORKSPACE</div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-label">{item.label}</span>
            <span className="sidebar-link-indicator" />
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      <div className="sidebar-user-card">
        <div className="sidebar-user-avatar">
          {roleLabel.charAt(0)}
        </div>
        <div className="sidebar-user-info">
          <strong>{roleLabel}</strong>
          <span>DnyanCare Portal</span>
        </div>
      </div>

      <button className="sidebar-logout" onClick={handleLogout}>
        <span className="sidebar-logout-icon">↪</span>
        <span>Sign Out</span>
      </button>

      <div className="sidebar-footer">
        DnyanCare Healthcare System
      </div>
    </aside>
  );
}

export default Sidebar;


import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const role = String(
    user?.role || user?.user?.role || user?.userRole || ""
  ).toUpperCase();

  const adminMenuItems = [
    { label: "📊 Dashboard", path: "/" },
    { label: "👤 Patient List", path: "/patients" },
    { label: "➕ Patient Registration", path: "/patients/register" },
    { label: "🩺 Doctors", path: "/doctors" },
    { label: "📅 Appointments", path: "/appointments" },
  ];

  const doctorMenuItems = [
    { label: "🩺 Doctor Module", path: "/doctor-module" },
  ];

  const menuItems =
    role === "DOCTOR"
      ? doctorMenuItems
      : role === "ADMIN"
      ? adminMenuItems
      : adminMenuItems.filter(
          (item) =>
            role === "RECEPTIONIST" &&
            ["/", "/patients", "/patients/register", "/appointments"].includes(
              item.path
            )
        );

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🏥</div>
        <div>
          <h2>DnyanCare</h2>
          <span>Hospital Management</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
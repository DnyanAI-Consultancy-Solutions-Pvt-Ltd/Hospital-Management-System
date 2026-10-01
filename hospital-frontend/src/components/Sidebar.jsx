import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role;

  const menuItems = [
    {
      label: "📊 Dashboard",
      path: "/",
      roles: ["ADMIN", "DOCTOR", "RECEPTIONIST"]
    },
    {
      label: "👤 Patient List",
      path: "/patients",
      roles: ["ADMIN", "DOCTOR", "RECEPTIONIST"]
    },
    {
      label: "➕ Patient Registration",
      path: "/patients/register",
      roles: ["ADMIN", "RECEPTIONIST"]
    },
    {
  label: "🩺 Doctors",
  path: "/doctors",
  roles: ["ADMIN", "DOCTOR", "RECEPTIONIST"]
},
{
  label: "📅 Appointments",
  path: "/appointments",
  roles: ["ADMIN", "RECEPTIONIST", "DOCTOR"]
}
  ];

  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(role)
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
          <h2>MedCare</h2>
          <span>Hospital Management</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        {visibleItems.map((item) => (
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
import { useEffect, useState } from "react";

function Navbar() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <header className="navbar">

      <div className="navbar-left">
        <h1>Dashboard</h1>
      </div>

      <div className="navbar-right">

        <button className="notification">
          🔔
        </button>

        {user && (
          <div className="profile">

            <div className="profile-avatar">
              {user.fullName
                ? user.fullName.charAt(0).toUpperCase()
                : "U"}
            </div>

            <div className="profile-info">

              <strong>
                {user.fullName}
              </strong>

              <span>
                {user.role}
              </span>

            </div>

          </div>
        )}

      </div>

    </header>
  );
}

export default Navbar;
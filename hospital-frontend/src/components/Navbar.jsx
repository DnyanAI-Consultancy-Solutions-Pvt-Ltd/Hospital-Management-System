
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/api";

function Navbar() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const menuRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Load logged-in user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Invalid user data", error);
      }
    }
  }, []);

  
  // Fetch notifications from backend
  useEffect(() => {
    if (!user || !token) return;

    const fetchNotifications = async () => {
      try {
        const [notificationResponse, countResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/notifications`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),

          fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        ]);

        const notificationBody = await notificationResponse.text();
        const countBody = await countResponse.text();

        console.log("Notifications Status:", notificationResponse.status);
        console.log("Notifications Response:", notificationBody);

        console.log("Unread Count Status:", countResponse.status);
        console.log("Unread Count Response:", countBody);

        if (!notificationResponse.ok || !countResponse.ok) {
          throw new Error("Notification API failed");
        }

        setNotifications(JSON.parse(notificationBody));
        setUnreadCount(JSON.parse(countBody).count || 0);

      } catch (error) {
        console.error("Notification API error:", error);
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 15000);

    return () => clearInterval(interval);

  }, [user, token]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Mark notification as read
  const handleMarkAsRead = async (notification) => {
    try {
      if (!notification.isRead) {
        const response = await fetch(
          `${API_BASE_URL}/api/notifications/${notification.id}/read`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error("Failed to mark notification as read");
        }

        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? { ...item, isRead: true }
              : item
          )
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      setNotificationOpen(false);

      if (notification.link) {
        navigate(notification.link);
      }

    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (id) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      const deletedNotification = notifications.find(
        (item) => item.id === id
      );

      setNotifications((prev) =>
        prev.filter((item) => item.id !== id)
      );

      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

    } catch (error) {
      console.error("Delete notification error:", error);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="navbar">

      <div className="navbar-left">
        <h1>Dashboard</h1>
      </div>

      <div className="navbar-right">

        {/* Notification Bell */}
        <div className="notification-container" ref={notificationRef}>
          <button
            className="notification"
            type="button"
            onClick={() => setNotificationOpen(!notificationOpen)}
          >
            🔔

            {unreadCount > 0 && (
              <span className="notification-count">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="notification-dropdown">

              <div className="notification-header">
                <strong>Notifications</strong>
                <span>{unreadCount} Unread</span>
              </div>

              <div className="notification-list">

                {notifications.length === 0 ? (
                  <p className="no-notifications">
                    No notifications available
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${
                        !notification.isRead ? "unread" : ""
                      }`}
                    >
                      <div
                        className="notification-content"
                        onClick={() => handleMarkAsRead(notification)}
                      >
                        <strong>{notification.title}</strong>

                        <p>{notification.message}</p>

                        <small>
                          {notification.createdAt
                            ? new Date(notification.createdAt).toLocaleString()
                            : ""}
                        </small>
                      </div>

                      <button
                        type="button"
                        className="delete-notification"
                        title="Delete notification"
                        onClick={() =>
                          handleDeleteNotification(notification.id)
                        }
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}

              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        {user && (
          <div className="profile-container" ref={menuRef}>

            <button
              className="profile"
              type="button"
              onClick={() => setOpen(!open)}
            >
              <div className="profile-avatar">
                {user.fullName
                  ? user.fullName.charAt(0).toUpperCase()
                  : "U"}
              </div>

              <div className="profile-info">
                <strong>{user.fullName}</strong>
                <span>{user.role}</span>
              </div>

              <span className="dropdown-arrow">
                {open ? "▲" : "▼"}
              </span>
            </button>

            {open && (
              <div className="profile-dropdown">

                <div className="dropdown-header">
                  <strong>{user.fullName}</strong>
                  <span>{user.username || user.role}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate("/profile");
                  }}
                >
                  👤 My Profile
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate("/users");
                  }}
                >
                  👥 Users
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate("/settings");
                  }}
                >
                  ⚙️ Settings
                </button>

                <hr />

                <button
                  type="button"
                  className="signout-button"
                  onClick={handleSignOut}
                >
                  ↪ Sign Out
                </button>

              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
}

export default Navbar;

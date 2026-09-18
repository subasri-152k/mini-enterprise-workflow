import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/notifications/`,
        authConfig
      );

      setNotifications(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("Notifications error:", err);

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError(
          err.response?.data?.detail ||
            "Failed to load notifications."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `${API_URL}/notifications/${notificationId}/read`,
        {},
        authConfig
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                is_read: true,
              }
            : notification
        )
      );
    } catch (err) {
      console.error(
        "Mark notification as read error:",
        err
      );
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString();
  };

  return (
    <div className="notifications-page">

      {/* Header */}
      <div className="notifications-header">

        <div>
          <div className="section-label">
            WORKSPACE
          </div>

          <h1>Notifications</h1>

          <p>
            Stay updated with your workflow activity.
          </p>
        </div>

        <div className="notification-count">
          🔔
          <span>{unreadCount} unread</span>
        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="notification-error">
          ⚠️ {error}
        </div>
      )}

      {/* Content */}
      <div className="notifications-card">

        <div className="notifications-card-header">
          <h2>Recent Notifications</h2>

          <button
            onClick={fetchNotifications}
            className="refresh-button"
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (

          <div className="notification-empty">
            <div className="notification-loader"></div>
            <p>Loading notifications...</p>
          </div>

        ) : notifications.length === 0 ? (

          <div className="notification-empty">
            <div className="empty-icon">
              🔕
            </div>

            <h3>No notifications</h3>

            <p>
              You're all caught up!
            </p>
          </div>

        ) : (

          <div className="notification-list">

            {notifications.map((notification) => (

              <div
                key={notification.id}
                className={
                  notification.is_read
                    ? "notification-item read"
                    : "notification-item unread"
                }
              >

                <div className="notification-icon">
                  {notification.is_read
                    ? "✓"
                    : "🔔"}
                </div>

                <div className="notification-content">

                  <div className="notification-message">
                    {notification.message}
                  </div>

                  <div className="notification-date">
                    {formatDate(
                      notification.created_at
                    )}
                  </div>

                </div>

                {!notification.is_read && (
                  <button
                    className="read-button"
                    onClick={() =>
                      markAsRead(notification.id)
                    }
                  >
                    Mark as read
                  </button>
                )}

                {!notification.is_read && (
                  <span className="unread-dot"></span>
                )}

              </div>

            ))}

          </div>

        )}

      </div>

      <style>{`

        .notifications-page {
          min-height: 100vh;
          background: #f4f7fb;
          padding: 45px 36px;
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 35px;
          gap: 25px;
        }

        .section-label {
          color: #2563eb;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }

        .notifications-header h1 {
          margin: 0;
          color: #111827;
          font-size: 40px;
          font-weight: 800;
        }

        .notifications-header p {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 15px;
        }

        .notification-count {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 17px;
          background: #ffffff;
          border: 1px solid #e0e7ef;
          border-radius: 10px;
          color: #2563eb;
          font-size: 18px;
        }

        .notification-count span {
          color: #475569;
          font-size: 13px;
          font-weight: 700;
        }

        .notification-error {
          padding: 13px 16px;
          margin-bottom: 20px;
          border-radius: 9px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-size: 14px;
        }

        .notifications-card {
          background: #ffffff;
          border: 1px solid #e0e7ef;
          border-radius: 16px;
          box-shadow:
            0 6px 25px rgba(15, 23, 42, 0.04);
          overflow: hidden;
        }

        .notifications-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 25px 30px;
          border-bottom: 1px solid #e5eaf1;
        }

        .notifications-card-header h2 {
          margin: 0;
          color: #172033;
          font-size: 20px;
        }

        .refresh-button {
          border: 1px solid #d7e0ec;
          background: #ffffff;
          color: #2563eb;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
        }

        .refresh-button:hover {
          background: #f8fbff;
        }

        .notification-list {
          display: flex;
          flex-direction: column;
        }

        .notification-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 21px 30px;
          border-bottom: 1px solid #edf1f5;
          transition: background 0.2s ease;
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .notification-item.unread {
          background: #f8fbff;
        }

        .notification-item.read {
          background: #ffffff;
        }

        .notification-icon {
          width: 45px;
          height: 45px;
          flex-shrink: 0;
          border-radius: 12px;
          background: #eef4ff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2563eb;
          font-size: 19px;
          font-weight: 800;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-message {
          color: #172033;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.5;
        }

        .notification-date {
          margin-top: 5px;
          color: #94a3b8;
          font-size: 12px;
        }

        .read-button {
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #2563eb;
          padding: 8px 12px;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .read-button:hover {
          background: #eff6ff;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          background: #2563eb;
          border-radius: 50%;
        }

        .notification-empty {
          min-height: 280px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
        }

        .empty-icon {
          font-size: 42px;
          margin-bottom: 12px;
        }

        .notification-empty h3 {
          margin: 0;
          color: #475569;
          font-size: 18px;
        }

        .notification-empty p {
          margin: 7px 0 0;
          font-size: 14px;
        }

        .notification-loader {
          width: 35px;
          height: 35px;
          border: 4px solid #dbe4f0;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: notificationSpin .8s linear infinite;
          margin-bottom: 14px;
        }

        @keyframes notificationSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 700px) {

          .notifications-page {
            padding: 25px 18px;
          }

          .notifications-header {
            flex-direction: column;
          }

          .notifications-header h1 {
            font-size: 32px;
          }

          .notifications-card-header {
            padding: 20px;
          }

          .notification-item {
            align-items: flex-start;
            padding: 18px 20px;
            flex-wrap: wrap;
          }

          .notification-content {
            width: calc(100% - 60px);
          }

          .read-button {
            margin-left: 60px;
          }

        }

      `}</style>

    </div>
  );
}

export default Notifications;
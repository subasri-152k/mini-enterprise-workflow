import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1";

function Dashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState(0);
  const [aiSummary, setAiSummary] = useState(null);
  const [activityFeed, setActivityFeed] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  // =========================================================
  // FETCH DASHBOARD DATA
  // =========================================================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          navigate("/login");
          return;
        }

        const authConfig = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // =====================================================
        // TASKS
        // =====================================================

        const taskResponse = await axios.get(
          `${API_URL}/tasks`,
          authConfig
        );

        const taskData = Array.isArray(taskResponse.data)
          ? taskResponse.data
          : [];

        setTasks(taskData);

        // =====================================================
        // TEAM MEMBERS
        // =====================================================

        try {
          const userResponse = await axios.get(
            `${API_URL}/users`,
            authConfig
          );

          if (Array.isArray(userResponse.data)) {
            setTeamMembers(userResponse.data.length);
          } else if (Array.isArray(userResponse.data?.users)) {
            setTeamMembers(userResponse.data.users.length);
          }
        } catch (userError) {
          console.warn(
            "Users API unavailable. Calculating team members from tasks."
          );

          const uniqueUsers = new Set(
            taskData
              .map((task) => task.assigned_to_id)
              .filter(
                (id) => id !== null && id !== undefined
              )
          );

          setTeamMembers(uniqueUsers.size);
        }

        // =====================================================
        // AI SUMMARY
        // =====================================================

        try {
          const aiResponse = await axios.get(
            `${API_URL}/dashboard/ai-summary`,
            authConfig
          );

          setAiSummary(aiResponse.data);
        } catch (aiError) {
          console.warn(
            "AI Summary API unavailable:",
            aiError
          );
        }

        // =====================================================
        // ACTIVITY FEED
        // =====================================================

        try {
          const activityResponse = await axios.get(
            `${API_URL}/activity-feed/`,
            authConfig
          );

          setActivityFeed(
            Array.isArray(activityResponse.data)
              ? activityResponse.data
              : []
          );
        } catch (activityError) {
          console.warn(
            "Activity Feed API unavailable:",
            activityError
          );
        }

        // =====================================================
        // NOTIFICATIONS
        // =====================================================

        try {
          const notificationResponse = await axios.get(
            `${API_URL}/notifications/`,
            authConfig
          );

          const notificationData = Array.isArray(
            notificationResponse.data
          )
            ? notificationResponse.data
            : [];

          setNotifications(notificationData.slice(0, 5));
        } catch (notificationError) {
          console.warn(
            "Notifications API unavailable:",
            notificationError
          );
        }
      } catch (err) {
        console.error(
          "Dashboard API Error:",
          err
        );

        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
          return;
        }

        setError(
          err.response?.data?.detail ||
            "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, token]);

  // =========================================================
  // TASK COUNTS
  // =========================================================

  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter((task) => {
    const status = String(task.status || "")
      .toLowerCase()
      .replaceAll("-", "_")
      .replaceAll(" ", "_");

    return (
      status === "pending" ||
      status === "todo" ||
      status === "in_progress" ||
      status === "review"
    );
  }).length;

  const completedTasks = tasks.filter((task) => {
    const status = String(task.status || "")
      .toLowerCase()
      .replaceAll("-", "_")
      .replaceAll(" ", "_");

    return (
      status === "completed" ||
      status === "done"
    );
  }).length;

  // =========================================================
  // RECENT TASKS
  // =========================================================

  const recentTasks = [...tasks]
    .sort((a, b) => {
      const dateA = new Date(
        a.created_at || a.id || 0
      );

      const dateB = new Date(
        b.created_at || b.id || 0
      );

      return dateB - dateA;
    })
    .slice(0, 5);

  // =========================================================
  // HELPERS
  // =========================================================

  const formatStatus = (status) => {
    return String(status || "pending")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const getStatusClass = (status) => {
    const value = String(status || "")
      .toLowerCase()
      .replaceAll("-", "_")
      .replaceAll(" ", "_");

    if (
      value === "completed" ||
      value === "done"
    ) {
      return "recent-status completed";
    }

    if (value === "in_progress") {
      return "recent-status progress";
    }

    if (
      value === "cancelled" ||
      value === "canceled"
    ) {
      return "recent-status cancelled";
    }

    return "recent-status pending";
  };

  const formatDate = (date) => {
    if (!date) {
      return "No due date";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "No due date";
    }

    return parsedDate.toLocaleDateString();
  };

  const formatActivityDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString();
  };

  // =========================================================
  // DASHBOARD CARDS
  // =========================================================

  const cards = [
    {
      icon: "📋",
      title: "Total Tasks",
      value: totalTasks,
      description: "All workflow tasks",
      className: "blue",
      action: () => navigate("/tasks"),
    },
    {
      icon: "⏳",
      title: "Pending Tasks",
      value: pendingTasks,
      description: "Tasks waiting for action",
      className: "yellow",
      action: () => navigate("/tasks"),
    },
    {
      icon: "✅",
      title: "Completed",
      value: completedTasks,
      description: "Successfully completed",
      className: "green",
      action: () => navigate("/tasks"),
    },
    {
      icon: "👥",
      title: "Team Members",
      value: teamMembers,
      description: "Active workspace members",
      className: "purple",
      action: () => navigate("/users"),
      showUsersLink: true,
    },
    {
      icon: "📝",
      title: "Approvals",
      value: "View",
      description: "Manage approval requests",
      className: "orange",
      action: () => navigate("/approvals"),
    },
  ];

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <>
        <div className="dashboard-loading">
          <div className="dashboard-loader"></div>
          <p>Loading dashboard...</p>
        </div>

        <style>{`
          .dashboard-loading {
            min-height: 100vh;
            background: #f4f7fb;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #64748b;
            font-size: 15px;
          }

          .dashboard-loader {
            width: 38px;
            height: 38px;
            border: 4px solid #dbe4f0;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: dashboardSpin .8s linear infinite;
            margin-bottom: 15px;
          }

          @keyframes dashboardSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </>
    );
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <div className="dashboard-header">

        <div className="header-left">
          <div className="workspace-label">
            WORKSPACE
          </div>

          <h1>Dashboard</h1>

          <p>
            Welcome back! Here's what's happening
            with your workflow.
          </p>
        </div>

        <div className="workspace-card">

          <div className="workspace-icon">
            🗓️
          </div>

          <div>
            <span>Workspace</span>
            <strong>Mini Enterprise</strong>
          </div>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="dashboard-error">

          <strong>
            Unable to load dashboard
          </strong>

          <span>{error}</span>

          <button
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>

        </div>
      )}

      {/* STAT CARDS */}

      <div className="dashboard-cards">

        {cards.map((card, index) => (
          <div
            className="dashboard-card"
            key={index}
            onClick={card.action}
          >

            <div
              className={`card-icon ${card.className}`}
            >
              {card.icon}
            </div>

            <div className="card-arrow">
              →
            </div>

            <div className="card-content">

              <div className="card-title">
                {card.title}
              </div>

              <div className="card-value">
                {card.value}
              </div>

              <div className="card-description">
                {card.description}
              </div>

              {card.showUsersLink && (
                <button
                  className="card-link"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate("/users");
                  }}
                >
                  View All Users →
                </button>
              )}

            </div>

          </div>
        ))}

      </div>

      {/* AI INTELLIGENCE */}

      <div className="intelligence-section">

        <div className="section-heading">

          <div>
            <div className="activity-label">
              INTELLIGENCE
            </div>

            <h2>
              AI Workflow Insights
            </h2>
          </div>

          <div className="ai-badge">
            🤖 AI
          </div>

        </div>

        {aiSummary ? (

          <div className="ai-summary-content">

            <div className="ai-summary-message">

              <div className="ai-message-icon">
                💡
              </div>

              <div>
                <h3>Workflow Summary</h3>

                <p>
                  {aiSummary.summary ||
                    "No workflow insights available."}
                </p>
              </div>

            </div>

            <div className="ai-metrics">

              <div className="ai-metric pending">

                <span className="metric-icon">
                  ⏳
                </span>

                <div>
                  <strong>
                    {aiSummary.pending_tasks ?? 0}
                  </strong>

                  <span>
                    Pending Tasks
                  </span>
                </div>

              </div>

              <div className="ai-metric high">

                <span className="metric-icon">
                  🔥
                </span>

                <div>
                  <strong>
                    {aiSummary.high_priority_tasks ?? 0}
                  </strong>

                  <span>
                    High Priority
                  </span>
                </div>

              </div>

              <div className="ai-metric overdue">

                <span className="metric-icon">
                  ⚠️
                </span>

                <div>
                  <strong>
                    {aiSummary.overdue_tasks ?? 0}
                  </strong>

                  <span>
                    Overdue Tasks
                  </span>
                </div>

              </div>

            </div>

          </div>

        ) : (

          <div className="ai-empty">
            <span>🤖</span>
            <p>
              AI insights are currently unavailable.
            </p>
          </div>

        )}

      </div>

      {/* =====================================================
          RECENT NOTIFICATIONS
      ===================================================== */}

      <div className="notifications-section">

        <div className="recent-header">

          <div>

            <div className="activity-label">
              NOTIFICATIONS
            </div>

            <h2>
              Recent Notifications
            </h2>

          </div>

          <button
            className="view-all-button"
            onClick={() =>
              navigate("/notifications")
            }
          >
            View All →
          </button>

        </div>

        <div className="recent-divider"></div>

        {notifications.length > 0 ? (

          <div className="notification-list">

            {notifications.map((notification) => (

              <div
                className={`notification-item ${
                  notification.is_read
                    ? ""
                    : "unread"
                }`}
                key={notification.id}
              >

                <div className="notification-icon">
                  🔔
                </div>

                <div className="notification-content">

                  <p>
                    {notification.message ||
                      "New notification"}
                  </p>

                  <span>
                    {formatActivityDate(
                      notification.created_at
                    )}
                  </span>

                </div>

                {!notification.is_read && (
                  <span className="unread-dot"></span>
                )}

              </div>

            ))}

          </div>

        ) : (

          <div className="notification-empty">

            <div className="notification-empty-icon">
              🔔
            </div>

            <h3>
              No recent notifications
            </h3>

            <p>
              New task, approval and comment
              notifications will appear here.
            </p>

          </div>

        )}

      </div>

      {/* RECENT TASKS */}

      <div className="recent-section">

        <div className="recent-header">

          <div>

            <div className="activity-label">
              ACTIVITY
            </div>

            <h2>
              Recent Tasks
            </h2>

          </div>

          <button
            className="view-all-button"
            onClick={() => navigate("/tasks")}
          >
            View All →
          </button>

        </div>

        <div className="recent-divider"></div>

        {recentTasks.length > 0 ? (

          <div className="recent-task-list">

            {recentTasks.map((task) => (

              <div
                className="recent-task-item"
                key={task.id}
              >

                <div className="recent-task-icon">
                  📋
                </div>

                <div className="recent-task-info">

                  <h3>
                    {task.title || "Untitled Task"}
                  </h3>

                  <p>
                    {task.description ||
                      "No description"}
                  </p>

                </div>

                <div className="recent-task-meta">

                  <span
                    className={getStatusClass(
                      task.status
                    )}
                  >
                    {formatStatus(task.status)}
                  </span>

                  <span className="recent-task-date">
                    {formatDate(task.due_date)}
                  </span>

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="empty-state">

            <div className="empty-icon-wrapper">
              📬
            </div>

            <h3>
              No tasks yet
            </h3>

            <p>
              Your recent workflow tasks will
              appear here.
            </p>

            <button
              className="create-task-button"
              onClick={() =>
                navigate("/tasks/create")
              }
            >
              + Create Your First Task
            </button>

          </div>

        )}

      </div>

      {/* ACTIVITY FEED */}

      <div className="activity-feed-section">

        <div className="section-heading">

          <div>

            <div className="activity-label">
              TRACEABILITY
            </div>

            <h2>
              Activity Feed
            </h2>

          </div>

          <div className="feed-icon">
            📋
          </div>

        </div>

        {activityFeed.length > 0 ? (

          <div className="activity-feed-list">

            {activityFeed.slice(0, 8).map((activity) => (

              <div
                className="activity-feed-item"
                key={activity.id}
              >

                <div className="activity-avatar">

                  {activity.user_name
                    ? activity.user_name
                        .charAt(0)
                        .toUpperCase()
                    : "U"}

                </div>

                <div className="activity-feed-content">

                  <div className="activity-feed-top">

                    <strong>
                      {activity.user_name ||
                        "User"}
                    </strong>

                    <span>
                      {formatActivityDate(
                        activity.created_at
                      )}
                    </span>

                  </div>

                  <div className="activity-action">
                    {activity.action ||
                      "Activity recorded"}
                  </div>

                  {activity.description && (
                    <p>
                      {activity.description}
                    </p>
                  )}

                  {activity.task_title && (
                    <div className="activity-task">
                      📋 {activity.task_title}
                    </div>
                  )}

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="activity-empty">

            <div>📭</div>

            <h3>
              No recent activity
            </h3>

            <p>
              Task and workflow activities will
              appear here.
            </p>

          </div>

        )}

      </div>

      {/* =====================================================
          CSS
      ===================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .dashboard-page {
          min-height: 100vh;
          background: #f4f7fb;
          padding: 45px 36px;
        }

        /* HEADER */

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          gap: 30px;
        }

        .workspace-label {
          color: #2563eb;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }

        .header-left h1 {
          margin: 0;
          color: #111827;
          font-size: 42px;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .header-left p {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 16px;
        }

        /* WORKSPACE */

        .workspace-card {
          min-width: 225px;
          padding: 20px;
          background: #ffffff;
          border: 1px solid #e0e7ef;
          border-radius: 15px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 5px 20px rgba(15, 23, 42, 0.05);
        }

        .workspace-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #eef4ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .workspace-card span {
          display: block;
          color: #94a3b8;
          font-size: 13px;
          margin-bottom: 5px;
        }

        .workspace-card strong {
          display: block;
          color: #172033;
          font-size: 15px;
        }

        /* ERROR */

        .dashboard-error {
          background: #fff1f2;
          border: 1px solid #fecdd3;
          border-radius: 12px;
          padding: 15px 18px;
          margin-bottom: 25px;
          color: #be123c;
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .dashboard-error strong {
          font-size: 14px;
        }

        .dashboard-error span {
          flex: 1;
          font-size: 14px;
        }

        .dashboard-error button {
          border: none;
          background: #be123c;
          color: white;
          padding: 8px 15px;
          border-radius: 7px;
          font-weight: 600;
          cursor: pointer;
        }

        /* CARDS */

        .dashboard-cards {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 24px;
          margin-bottom: 25px;
        }

        .dashboard-card {
          position: relative;
          min-height: 265px;
          background: #ffffff;
          border: 1px solid #e0e7ef;
          border-radius: 16px;
          padding: 26px 24px;
          cursor: pointer;
          transition: 0.2s ease;
          box-shadow: 0 6px 25px rgba(15, 23, 42, 0.04);
        }

        .dashboard-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.09);
        }

        .card-icon {
          width: 54px;
          height: 54px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
        }

        .card-icon.blue {
          background: #edf5ff;
        }

        .card-icon.yellow {
          background: #fff6e8;
        }

        .card-icon.green {
          background: #eafbf3;
        }

        .card-icon.purple {
          background: #f2edff;
        }

        .card-icon.orange {
          background: #fff3e8;
        }

        .card-arrow {
          position: absolute;
          right: 25px;
          top: 30px;
          color: #6b8dbd;
          font-size: 21px;
        }

        .card-content {
          text-align: center;
          margin-top: 28px;
        }

        .card-title {
          color: #47678e;
          font-size: 16px;
          margin-bottom: 12px;
        }

        .card-value {
          color: #0f172a;
          font-size: 38px;
          line-height: 1;
          font-weight: 500;
        }

        .card-description {
          margin-top: 14px;
          color: #91a4c0;
          font-size: 14px;
        }

        .card-link {
          margin-top: 12px;
          padding: 0;
          border: none;
          background: transparent;
          color: #2563eb;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .card-link:hover {
          text-decoration: underline;
        }

        /* SECTIONS */

        .intelligence-section,
        .notifications-section,
        .activity-feed-section {
          background: #ffffff;
          border: 1px solid #e0e7ef;
          border-radius: 16px;
          margin-bottom: 25px;
          padding: 30px 35px;
          box-shadow: 0 6px 25px rgba(15, 23, 42, 0.04);
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
        }

        .section-heading h2 {
          margin: 0;
          color: #111827;
          font-size: 24px;
        }

        .activity-label {
          color: #2563eb;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }

        /* AI */

        .ai-badge {
          padding: 8px 14px;
          border-radius: 20px;
          background: #eef4ff;
          color: #2563eb;
          font-size: 13px;
          font-weight: 800;
        }

        .ai-summary-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .ai-summary-message {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: #f8fbff;
          border: 1px solid #e1ebfa;
          border-radius: 13px;
        }

        .ai-message-icon {
          width: 50px;
          height: 50px;
          flex-shrink: 0;
          border-radius: 12px;
          background: #eaf2ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .ai-summary-message h3 {
          margin: 0 0 7px;
          color: #172033;
          font-size: 16px;
        }

        .ai-summary-message p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.6;
        }

        .ai-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .ai-metric {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px;
          border: 1px solid #e5eaf1;
          border-radius: 13px;
          background: #ffffff;
        }

        .metric-icon {
          width: 44px;
          height: 44px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .ai-metric.pending .metric-icon {
          background: #fff7ed;
        }

        .ai-metric.high .metric-icon {
          background: #fff1f2;
        }

        .ai-metric.overdue .metric-icon {
          background: #fff7ed;
        }

        .ai-metric strong {
          display: block;
          color: #0f172a;
          font-size: 26px;
        }

        .ai-metric span:last-child {
          display: block;
          margin-top: 3px;
          color: #94a3b8;
          font-size: 12px;
        }

        .ai-empty {
          padding: 35px;
          text-align: center;
          color: #94a3b8;
        }

        .ai-empty span {
          display: block;
          font-size: 32px;
          margin-bottom: 10px;
        }

        .ai-empty p {
          margin: 0;
        }

        /* COMMON HEADER */

        .recent-header {
          padding: 0 0 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .recent-header h2 {
          margin: 0;
          color: #111827;
          font-size: 24px;
        }

        .view-all-button {
          padding: 10px 17px;
          border: 1px solid #d7e0ec;
          background: #ffffff;
          color: #2563eb;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .view-all-button:hover {
          background: #f8fbff;
        }

        .recent-divider {
          height: 1px;
          background: #e5eaf1;
        }

        /* NOTIFICATIONS */

        .notification-list {
          display: flex;
          flex-direction: column;
        }

        .notification-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 17px 5px;
          border-bottom: 1px solid #edf1f5;
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .notification-item.unread {
          background: #f8fbff;
          border-radius: 9px;
          padding-left: 12px;
          padding-right: 12px;
        }

        .notification-icon {
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          border-radius: 11px;
          background: #eef4ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-content p {
          margin: 0 0 5px;
          color: #334155;
          font-size: 14px;
          line-height: 1.5;
        }

        .notification-content span {
          color: #94a3b8;
          font-size: 11px;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2563eb;
          flex-shrink: 0;
        }

        .notification-empty {
          text-align: center;
          padding: 45px 20px 25px;
          color: #94a3b8;
        }

        .notification-empty-icon {
          width: 58px;
          height: 58px;
          margin: 0 auto 13px;
          border-radius: 50%;
          background: #eef4ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
        }

        .notification-empty h3 {
          margin: 0 0 7px;
          color: #475569;
          font-size: 17px;
        }

        .notification-empty p {
          margin: 0;
          font-size: 13px;
        }

        /* RECENT TASKS */

        .recent-section {
          background: #ffffff;
          border: 1px solid #e0e7ef;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 25px;
          padding: 35px;
          box-shadow: 0 6px 25px rgba(15, 23, 42, 0.04);
        }

        .recent-task-list {
          padding: 10px 0 25px;
        }

        .recent-task-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 5px;
          border-bottom: 1px solid #edf1f5;
        }

        .recent-task-item:last-child {
          border-bottom: none;
        }

        .recent-task-icon {
          width: 45px;
          height: 45px;
          border-radius: 12px;
          background: #eef4ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
          flex-shrink: 0;
        }

        .recent-task-info {
          flex: 1;
          min-width: 0;
        }

        .recent-task-info h3 {
          margin: 0 0 5px;
          color: #172033;
          font-size: 15px;
        }

        .recent-task-info p {
          margin: 0;
          color: #8a9bb2;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .recent-task-meta {
          display: flex;
          align-items: flex-end;
          flex-direction: column;
          gap: 7px;
        }

        .recent-status {
          padding: 5px 11px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }

        .recent-status.pending {
          background: #fff7ed;
          color: #c2410c;
        }

        .recent-status.progress {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .recent-status.completed {
          background: #ecfdf5;
          color: #047857;
        }

        .recent-status.cancelled {
          background: #fef2f2;
          color: #b91c1c;
        }

        .recent-task-date {
          color: #94a3b8;
          font-size: 12px;
        }

        /* ACTIVITY FEED */

        .feed-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #eef4ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
        }

        .activity-feed-list {
          display: flex;
          flex-direction: column;
        }

        .activity-feed-item {
          display: flex;
          gap: 15px;
          padding: 18px 0;
          border-bottom: 1px solid #edf1f5;
        }

        .activity-feed-item:last-child {
          border-bottom: none;
        }

        .activity-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #eef4ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .activity-feed-content {
          flex: 1;
          min-width: 0;
        }

        .activity-feed-top {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 5px;
        }

        .activity-feed-top strong {
          color: #172033;
          font-size: 14px;
        }

        .activity-feed-top span {
          color: #94a3b8;
          font-size: 11px;
        }

        .activity-action {
          color: #475569;
          font-size: 13px;
          font-weight: 600;
        }

        .activity-feed-content p {
          margin: 5px 0 0;
          color: #8a9bb2;
          font-size: 13px;
        }

        .activity-task {
          display: inline-block;
          margin-top: 8px;
          padding: 5px 9px;
          border-radius: 6px;
          background: #f8fafc;
          color: #64748b;
          font-size: 11px;
        }

        .activity-empty {
          text-align: center;
          padding: 35px 20px;
          color: #94a3b8;
        }

        .activity-empty div {
          font-size: 30px;
          margin-bottom: 10px;
        }

        .activity-empty h3 {
          margin: 0 0 6px;
          color: #475569;
          font-size: 16px;
        }

        .activity-empty p {
          margin: 0;
          font-size: 13px;
        }

        /* EMPTY */

        .empty-state {
          text-align: center;
          padding: 70px 25px;
        }

        .empty-icon-wrapper {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #eef4ff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 31px;
        }

        .empty-state h3 {
          margin: 0;
          color: #172033;
          font-size: 21px;
        }

        .empty-state p {
          margin: 10px 0 23px;
          color: #91a4c0;
          font-size: 15px;
        }

        .create-task-button {
          border: none;
          background: #2563eb;
          color: #ffffff;
          padding: 12px 20px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .create-task-button:hover {
          background: #1d4ed8;
        }

        /* RESPONSIVE */

        @media (max-width: 1100px) {

          .dashboard-cards {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .ai-metrics {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {

          .dashboard-page {
            padding: 25px 18px;
          }

          .dashboard-header {
            flex-direction: column;
          }

          .header-left h1 {
            font-size: 34px;
          }

          .workspace-card {
            width: 100%;
          }

          .dashboard-cards {
            grid-template-columns: 1fr;
          }

          .intelligence-section,
          .notifications-section,
          .activity-feed-section,
          .recent-section {
            padding: 25px 20px;
          }

          .recent-task-item {
            align-items: flex-start;
          }

          .recent-task-meta {
            align-items: flex-end;
          }

          .activity-feed-top {
            flex-direction: column;
            gap: 4px;
          }

          .notification-item.unread {
            padding-left: 8px;
            padding-right: 8px;
          }
        }

      `}</style>

    </div>
  );
}

export default Dashboard;
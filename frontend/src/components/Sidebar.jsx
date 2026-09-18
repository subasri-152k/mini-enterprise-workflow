import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: "📊" },
  { label: "Tasks", path: "/tasks", icon: "✓" },
  { label: "Approvals", path: "/approvals", icon: "📋" },
  { label: "Notifications", path: "/notifications", icon: "🔔" },
  { label: "Documents", path: "/documents", icon: "📄" },
  { label: "Users", path: "/users", icon: "👥" },
  {
  label: "Audit Logs",path: "/audit-logs", icon: "🛡️",},
];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">M</div>

        <div>
          <h2>Mini Enterprise</h2>
          <span>Workflow</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-title">MAIN MENU</p>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">
              {item.icon}
            </span>

            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          <span>🚪</span>
          Logout
        </button>
      </div>

      <style>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 250px;
          height: 100vh;
          background: #111827;
          color: white;
          display: flex;
          flex-direction: column;
          z-index: 100;
        }

        .sidebar-logo {
          height: 80px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 22px;
          border-bottom: 1px solid #273244;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 800;
        }

        .sidebar-logo h2 {
          margin: 0;
          font-size: 15px;
        }

        .sidebar-logo span {
          color: #9ca3af;
          font-size: 11px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 25px 14px;
        }

        .nav-title {
          color: #6b7280;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin: 0 10px 12px;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 12px 14px;
          margin-bottom: 6px;
          border-radius: 8px;
          color: #cbd5e1;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: 0.2s;
        }

        .sidebar-link:hover {
          background: #1f2937;
          color: white;
        }

        .sidebar-link.active {
          background: #2563eb;
          color: white;
        }

        .sidebar-icon {
          width: 22px;
          text-align: center;
          font-size: 16px;
        }

        .sidebar-bottom {
          padding: 18px 14px;
          border-top: 1px solid #273244;
        }

        .logout-btn {
          width: 100%;
          border: none;
          background: transparent;
          color: #cbd5e1;
          padding: 12px 14px;
          border-radius: 8px;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .logout-btn:hover {
          background: #1f2937;
          color: white;
        }

        @media (max-width: 700px) {
          .sidebar {
            width: 70px;
          }

          .sidebar-logo {
            justify-content: center;
            padding: 0;
          }

          .sidebar-logo > div:last-child,
          .nav-title,
          .sidebar-link span:last-child,
          .logout-btn {
            font-size: 0;
          }

          .sidebar-link {
            justify-content: center;
          }

          .sidebar-icon {
            font-size: 18px;
          }

          .logout-btn {
            justify-content: center;
          }
        }
      `}</style>
    </aside>
  );
}

export default Sidebar;
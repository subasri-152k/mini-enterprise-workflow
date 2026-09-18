import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1";

function Users() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const token = localStorage.getItem("access_token");

  // ================= FETCH USERS =================

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!token) {
          navigate("/login");
          return;
        }

        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/users/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.users || [];

        setUsers(data);
      } catch (err) {
        console.error("Users API Error:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
          return;
        }

        setError(
          err.response?.data?.detail ||
            "Failed to load users."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate, token]);

  // ================= HELPERS =================

  const formatRole = (role) => {
    return String(role || "employee")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const getRoleClass = (role) => {
    const value = String(role || "").toLowerCase();

    if (value === "admin") {
      return "role admin";
    }

    if (value === "manager") {
      return "role manager";
    }

    return "role employee";
  };

  const getUserName = (user) => {
    return (
      user.name ||
      user.full_name ||
      user.username ||
      "User"
    );
  };

  // ================= FILTER USERS =================

  const filteredUsers = users.filter((user) => {
    const userName = getUserName(user).toLowerCase();
    const email = String(user.email || "").toLowerCase();
    const role = String(user.role || "").toLowerCase();

    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      userName.includes(searchValue) ||
      email.includes(searchValue);

    const matchesRole =
      roleFilter === "all" ||
      role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // ================= ROLE COUNTS =================

  const adminCount = users.filter(
    (user) =>
      String(user.role || "").toLowerCase() === "admin"
  ).length;

  const managerCount = users.filter(
    (user) =>
      String(user.role || "").toLowerCase() === "manager"
  ).length;

  const employeeCount = users.filter(
    (user) =>
      String(user.role || "").toLowerCase() === "employee"
  ).length;

  // ================= LOADING =================

  if (loading) {
    return (
      <>
        <div className="users-loading">
          <div className="users-loader"></div>
          <p>Loading users...</p>
        </div>

        <style>{`
          .users-loading {
            min-height: 100vh;
            background: #f4f7fb;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #64748b;
          }

          .users-loader {
            width: 38px;
            height: 38px;
            border: 4px solid #dbe4f0;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: usersSpin .8s linear infinite;
            margin-bottom: 15px;
          }

          @keyframes usersSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </>
    );
  }

  // ================= PAGE =================

  return (
    <div className="users-page">

      {/* ================= HEADER ================= */}

      <div className="users-header">

        <div>
          <div className="users-label">
            WORKSPACE
          </div>

          <h1>Team Members</h1>

          <p>
            Manage and view members of your workspace.
          </p>
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="users-error">
          <strong>
            Unable to load users
          </strong>

          <span>{error}</span>
        </div>
      )}

      {/* ================= SUMMARY CARDS ================= */}

      <div className="user-stat-grid">

        <div className="user-stat-card">
          <div className="stat-icon purple">
            👥
          </div>

          <div>
            <span>Total Members</span>
            <strong>{users.length}</strong>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="stat-icon red">
            🛡️
          </div>

          <div>
            <span>Admins</span>
            <strong>{adminCount}</strong>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="stat-icon orange">
            💼
          </div>

          <div>
            <span>Managers</span>
            <strong>{managerCount}</strong>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="stat-icon blue">
            👤
          </div>

          <div>
            <span>Employees</span>
            <strong>{employeeCount}</strong>
          </div>
        </div>

      </div>

      {/* ================= USERS TABLE ================= */}

      <div className="users-table-container">

        <div className="table-header">

          <div>
            <h2>Workspace Members</h2>

            <p>
              {filteredUsers.length} member
              {filteredUsers.length !== 1 ? "s" : ""} displayed
            </p>
          </div>

          <div className="table-controls">

            {/* SEARCH */}

            <div className="search-box">
              🔍

              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            {/* ROLE FILTER */}

            <select
              className="role-filter"
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value)
              }
            >
              <option value="all">
                All Roles
              </option>

              <option value="admin">
                Admin
              </option>

              <option value="manager">
                Manager
              </option>

              <option value="employee">
                Employee
              </option>
            </select>

          </div>

        </div>

        {filteredUsers.length > 0 ? (

          <div className="table-wrapper">

            <table className="users-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>USER</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                </tr>
              </thead>

              <tbody>

                {filteredUsers.map((user) => (

                  <tr key={user.id}>

                    <td>
                      #{user.id}
                    </td>

                    <td>

                      <div className="user-info">

                        <div className="user-avatar">
                          {getUserName(user)
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {getUserName(user)}
                          </strong>
                        </div>

                      </div>

                    </td>

                    <td>
                      {user.email || "No email"}
                    </td>

                    <td>
                      <span
                        className={getRoleClass(
                          user.role
                        )}
                      >
                        {formatRole(user.role)}
                      </span>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        ) : (

          <div className="empty-users">

            <div className="empty-users-icon">
              👥
            </div>

            <h3>
              No users found
            </h3>

            <p>
              Try changing your search or role filter.
            </p>

            {(search || roleFilter !== "all") && (
              <button
                className="clear-filter-button"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("all");
                }}
              >
                Clear Filters
              </button>
            )}

          </div>

        )}

      </div>

      {/* ================= CSS ================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .users-page {
          min-height: 100vh;
          background: #f4f7fb;
          padding: 45px 36px;
        }

        /* HEADER */

        .users-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          gap: 20px;
        }

        .users-label {
          color: #2563eb;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }

        .users-header h1 {
          margin: 0;
          color: #111827;
          font-size: 38px;
          font-weight: 800;
        }

        .users-header p {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 15px;
        }

        .back-button {
          border: 1px solid #d7e0ec;
          background: #ffffff;
          color: #2563eb;
          padding: 11px 17px;
          border-radius: 9px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .back-button:hover {
          background: #f8fbff;
          transform: translateY(-1px);
        }

        /* STAT CARDS */

        .user-stat-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 25px;
        }

        .user-stat-card {
          background: #ffffff;
          border: 1px solid #e0e7ef;
          border-radius: 14px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow:
            0 5px 20px rgba(15, 23, 42, 0.04);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
          flex-shrink: 0;
        }

        .stat-icon.purple {
          background: #f2edff;
        }

        .stat-icon.red {
          background: #fef2f2;
        }

        .stat-icon.orange {
          background: #fff7ed;
        }

        .stat-icon.blue {
          background: #edf5ff;
        }

        .user-stat-card span {
          display: block;
          color: #94a3b8;
          font-size: 12px;
          margin-bottom: 4px;
        }

        .user-stat-card strong {
          color: #172033;
          font-size: 25px;
        }

        /* TABLE */

        .users-table-container {
          background: #ffffff;
          border: 1px solid #e0e7ef;
          border-radius: 16px;
          overflow: hidden;
          box-shadow:
            0 6px 25px rgba(15, 23, 42, 0.04);
        }

        .table-header {
          padding: 25px 30px;
          border-bottom: 1px solid #edf1f5;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .table-header h2 {
          margin: 0 0 5px;
          color: #172033;
          font-size: 20px;
        }

        .table-header p {
          margin: 0;
          color: #94a3b8;
          font-size: 13px;
        }

        /* CONTROLS */

        .table-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .search-box {
          height: 40px;
          min-width: 220px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          background: #f8fafc;
          border: 1px solid #dce4ee;
          border-radius: 8px;
          color: #94a3b8;
        }

        .search-box input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #172033;
          font-size: 13px;
        }

        .search-box input::placeholder {
          color: #94a3b8;
        }

        .role-filter {
          height: 40px;
          padding: 0 12px;
          border: 1px solid #dce4ee;
          border-radius: 8px;
          background: #ffffff;
          color: #475569;
          font-size: 13px;
          cursor: pointer;
          outline: none;
        }

        /* TABLE */

        .table-wrapper {
          overflow-x: auto;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th {
          text-align: left;
          padding: 15px 25px;
          background: #f8fafc;
          color: #64748b;
          font-size: 11px;
          letter-spacing: 0.8px;
        }

        .users-table td {
          padding: 17px 25px;
          border-top: 1px solid #edf1f5;
          color: #64748b;
          font-size: 14px;
        }

        .users-table tbody tr {
          transition: 0.15s ease;
        }

        .users-table tbody tr:hover {
          background: #fafcff;
        }

        /* USER */

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #edf4ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          flex-shrink: 0;
        }

        .user-info strong {
          color: #172033;
        }

        /* ROLE */

        .role {
          display: inline-block;
          padding: 5px 11px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }

        .role.admin {
          background: #fef2f2;
          color: #b91c1c;
        }

        .role.manager {
          background: #fff7ed;
          color: #c2410c;
        }

        .role.employee {
          background: #eff6ff;
          color: #1d4ed8;
        }

        /* EMPTY */

        .empty-users {
          text-align: center;
          padding: 70px 20px;
        }

        .empty-users-icon {
          font-size: 40px;
          margin-bottom: 15px;
        }

        .empty-users h3 {
          margin: 0;
          color: #172033;
          font-size: 19px;
        }

        .empty-users p {
          margin: 8px 0 20px;
          color: #94a3b8;
          font-size: 14px;
        }

        .clear-filter-button {
          border: none;
          background: #2563eb;
          color: #ffffff;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
        }

        /* ERROR */

        .users-error {
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
          padding: 14px 18px;
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .users-error span {
          margin-left: 15px;
        }

        /* LOADING */

        .users-loading {
          min-height: 100vh;
          background: #f4f7fb;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }

        .users-loader {
          width: 38px;
          height: 38px;
          border: 4px solid #dbe4f0;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: usersSpin .8s linear infinite;
          margin-bottom: 15px;
        }

        @keyframes usersSpin {
          to {
            transform: rotate(360deg);
          }
        }

        /* RESPONSIVE */

        @media (max-width: 1100px) {
          .user-stat-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .table-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .table-controls {
            width: 100%;
          }

          .search-box {
            flex: 1;
          }
        }

        @media (max-width: 700px) {

          .users-page {
            padding: 25px 18px;
          }

          .users-header {
            flex-direction: column;
          }

          .users-header h1 {
            font-size: 32px;
          }

          .back-button {
            width: 100%;
          }

          .user-stat-grid {
            grid-template-columns: 1fr;
          }

          .table-header {
            padding: 20px;
          }

          .table-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            width: 100%;
          }

          .role-filter {
            width: 100%;
          }

          .users-table th,
          .users-table td {
            padding: 14px 16px;
          }
        }

      `}</style>

    </div>
  );
}

export default Users;
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import KanbanBoard from "../components/KanbanBoard";
import Comments from "../components/Comments";
const API_URL = "http://127.0.0.1:8000/api/v1";

function Tasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("table");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const token = localStorage.getItem("access_token");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("Please login to view tasks.");
        return;
      }

      const response = await axios.get(`${API_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("Tasks API Error:", err);

      if (err.response?.status === 401) {
        setError(
          "Session expired. Please login again."
        );

        localStorage.removeItem("access_token");
      } else {
        setError(
          err.response?.data?.detail ||
            "Failed to load tasks. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (
      value === "completed" ||
      value === "done"
    ) {
      return "status completed";
    }

    if (
      value === "in_progress" ||
      value === "in progress"
    ) {
      return "status progress";
    }

    if (value === "review") {
      return "status review";
    }

    if (
      value === "cancelled" ||
      value === "canceled"
    ) {
      return "status cancelled";
    }

    return "status pending";
  };

  const getPriorityClass = (priority) => {
    const value = String(priority || "").toLowerCase();

    if (
      value === "high" ||
      value === "urgent"
    ) {
      return "priority high";
    }

    if (value === "medium") {
      return "priority medium";
    }

    return "priority low";
  };

  return (
    <div className="tasks-page">

      {/* HEADER */}
      <div className="tasks-header">

        <div>
          <p className="eyebrow">
            WORKFLOW
          </p>

          <h1>Tasks</h1>

          <p>
            Manage and track your workflow tasks
          </p>
        </div>

        <div className="header-buttons">

          {/* VIEW TOGGLE */}
          <button
            className="view-btn"
            onClick={() =>
              setView(
                view === "table"
                  ? "kanban"
                  : "table"
              )
            }
          >
            {view === "table"
              ? "🗂️ Kanban View"
              : "📋 Table View"}
          </button>

          {/* DASHBOARD */}
          <button
            className="dashboard-btn"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Dashboard
          </button>

          {/* CREATE TASK */}
          <button
            className="create-task-btn"
            onClick={() =>
              navigate("/tasks/create")
            }
          >
            + Create Task
          </button>

        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="task-message">
          <div className="loader"></div>

          <p>
            Loading tasks...
          </p>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="task-error">

          <strong>
            Unable to load tasks
          </strong>

          <p>{error}</p>

          <button onClick={fetchTasks}>
            Try Again
          </button>

        </div>
      )}

      {/* CONTENT */}
      {!loading && !error && (
        <>
          {/* ========================= */}
          {/* KANBAN VIEW */}
          {/* ========================= */}

          {view === "kanban" ? (
            <div className="kanban-container">
              <KanbanBoard />
            </div>
          ) : (

            /* ========================= */
            /* TABLE VIEW */
            /* ========================= */

            <div className="tasks-card">

              {tasks.length === 0 ? (

                <div className="empty-tasks">

                  <div className="empty-icon">
                    📋
                  </div>

                  <h2>
                    No tasks found
                  </h2>

                  <p>
                    You don't have any tasks yet.
                    Create your first task to get
                    started.
                  </p>

                  <button
                    className="create-empty-btn"
                    onClick={() =>
                      navigate("/tasks/create")
                    }
                  >
                    + Create Task
                  </button>

                </div>

              ) : (

                <div className="table-wrapper">

                  <table className="tasks-table">

                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Task</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Assigned To</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>

                      {tasks.map((task) => (

                        <tr key={task.id}>

                          {/* ID */}
                          <td>
                            <span className="task-id">
                              #{task.id}
                            </span>
                          </td>

                          {/* TITLE */}
                          <td>
                            <div className="task-title">
                              {task.title}
                            </div>
                          </td>

                          {/* DESCRIPTION */}
                          <td>
                            <div className="task-description">
                              {task.description ||
                                "No description"}
                            </div>
                          </td>

                          {/* STATUS */}
                          <td>

                            <span
                              className={getStatusClass(
                                task.status
                              )}
                            >
                              {String(
                                task.status ||
                                  "pending"
                              )
                                .replaceAll(
                                  "_",
                                  " "
                                )
                                .replace(
                                  /\b\w/g,
                                  (char) =>
                                    char.toUpperCase()
                                )}
                            </span>

                          </td>

                          {/* PRIORITY */}
                          <td>

                            <span
                              className={getPriorityClass(
                                task.priority
                              )}
                            >
                              {String(
                                task.priority ||
                                  "low"
                              )
                                .replaceAll(
                                  "_",
                                  " "
                                )
                                .replace(
                                  /\b\w/g,
                                  (char) =>
                                    char.toUpperCase()
                                )}
                            </span>

                          </td>

                          {/* ASSIGNED USER */}
                          <td>

                            {task.assigned_to_id ? (

                              <span className="assigned-user">
                                User #
                                {task.assigned_to_id}
                              </span>

                            ) : (

                              <span className="unassigned">
                                Unassigned
                              </span>

                            )}

                          </td>

                          {/* DUE DATE */}
                          <td>

                            {task.due_date ? (

                              new Date(
                                task.due_date
                              ).toLocaleDateString()

                            ) : (

                              <span className="no-date">
                                No due date
                              </span>

                            )}

                          </td>

                          <td>
  <div className="task-actions">

    <button
      className="edit-task-btn"
      onClick={() =>
        navigate(`/tasks/edit/${task.id}`)
      }
    >
      ✏️ Edit
    </button>

    <button
      className="comments-btn"
      onClick={() =>
        setSelectedTaskId(task.id)
      }
    >
      💬 Comments
    </button>

  </div>
</td>

                          

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

            </div>
          )}
        </>
      )}
{selectedTaskId && (
  <Comments
    taskId={selectedTaskId}
    onClose={() => setSelectedTaskId(null)}
  />
)}
      {/* CSS */}
      <style>{`

        * {
          box-sizing: border-box;
        }

        .tasks-page {
          min-height: 100vh;
          background: #f5f7fb;
          padding: 35px;
        }

        .tasks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .eyebrow {
          margin: 0 0 7px;
          color: #2563eb;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .tasks-header h1 {
          margin: 0;
          font-size: 34px;
          font-weight: 750;
          color: #111827;
        }

        .tasks-header p {
          margin: 8px 0 0;
          color: #6b7280;
          font-size: 15px;
        }

        .header-buttons {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        /* VIEW BUTTON */

        .view-btn {
          border: 1px solid #c7d2fe;
          background: #eef2ff;
          color: #4338ca;
          padding: 13px 19px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .view-btn:hover {
          background: #e0e7ff;
          transform: translateY(-1px);
        }

        /* DASHBOARD BUTTON */

        .dashboard-btn {
          border: 1px solid #d5dce6;
          background: white;
          color: #334155;
          padding: 13px 19px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .dashboard-btn:hover {
          background: #f8fafc;
          transform: translateY(-1px);
        }

        /* CREATE BUTTON */

        .create-task-btn {
          border: none;
          background: #2563eb;
          color: white;
          padding: 13px 21px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .create-task-btn:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        /* TASK CARD */

        .tasks-card {
          background: white;
          border-radius: 15px;
          box-shadow:
            0 5px 25px
            rgba(0, 0, 0, 0.06);
          overflow: hidden;
        }

        /* KANBAN */

        .kanban-container {
          width: 100%;
        }

        /* TABLE */

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .tasks-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1050px;
        }

        .tasks-table thead {
          background: #f8fafc;
        }

        .tasks-table th {
          text-align: left;
          padding: 16px 18px;
          border-bottom:
            1px solid #e5e7eb;
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }

        .tasks-table td {
          padding: 17px 18px;
          border-bottom:
            1px solid #f1f5f9;
          color: #374151;
          font-size: 14px;
          vertical-align: middle;
        }

        .tasks-table tbody tr {
          transition: background 0.15s;
        }

        .tasks-table tbody tr:hover {
          background: #f8fafc;
        }

        /* TASK ID */

        .task-id {
          color: #64748b;
          font-weight: 600;
        }

        /* TITLE */

        .task-title {
          font-weight: 600;
          color: #111827;
          max-width: 200px;
        }

        /* DESCRIPTION */

        .task-description {
          color: #6b7280;
          max-width: 250px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* STATUS */

        .status {
          display: inline-flex;
          align-items: center;
          padding: 5px 11px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status.pending {
          background: #fff7ed;
          color: #c2410c;
        }

        .status.progress {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .status.review {
          background: #f5f3ff;
          color: #7c3aed;
        }

        .status.completed {
          background: #ecfdf5;
          color: #047857;
        }

        .status.cancelled {
          background: #fef2f2;
          color: #b91c1c;
        }

        /* PRIORITY */

        .priority {
          font-size: 13px;
          font-weight: 600;
        }

        .priority.high {
          color: #dc2626;
        }

        .priority.medium {
          color: #d97706;
        }

        .priority.low {
          color: #16a34a;
        }

        /* ASSIGNED USER */

        .assigned-user {
          color: #374151;
          font-weight: 500;
        }

        .unassigned {
          color: #9ca3af;
          font-style: italic;
        }

        .no-date {
          color: #9ca3af;
        }

        /* EDIT */

        .edit-task-btn {
          border: 1px solid #bfdbfe;
          background: #eff6ff;
          color: #1d4ed8;
          padding: 8px 13px;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
          white-space: nowrap;
        }

        .edit-task-btn:hover {
          background: #dbeafe;
          transform: translateY(-1px);
        }

        /* EMPTY */

        .empty-tasks {
          text-align: center;
          padding: 80px 25px;
        }

        .empty-icon {
          font-size: 50px;
          margin-bottom: 15px;
        }

        .empty-tasks h2 {
          margin: 0;
          color: #111827;
          font-size: 22px;
        }

        .empty-tasks p {
          color: #6b7280;
          max-width: 400px;
          margin: 10px auto 25px;
          line-height: 1.6;
        }

        .create-empty-btn {
          border: none;
          background: #2563eb;
          color: white;
          padding: 11px 18px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        /* LOADING */

        .task-message {
          background: white;
          border-radius: 15px;
          padding: 60px 20px;
          text-align: center;
          color: #6b7280;
          box-shadow:
            0 5px 25px
            rgba(0, 0, 0, 0.05);
        }

        .loader {
          width: 35px;
          height: 35px;
          border: 4px solid #e5e7eb;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation:
            spin 0.8s linear infinite;
          margin: 0 auto 15px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* ERROR */

        .task-error {
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
          padding: 20px;
          border-radius: 12px;
        }

        .task-error strong {
          font-size: 16px;
        }

        .task-error p {
          margin: 7px 0 15px;
        }

        .task-error button {
          border: none;
          background: #be123c;
          color: white;
          padding: 9px 15px;
          border-radius: 7px;
          cursor: pointer;
          font-weight: 600;
        }

        /* RESPONSIVE */

        @media (max-width: 1000px) {

          .tasks-header {
            align-items: flex-start;
            gap: 20px;
            flex-direction: column;
          }

          .header-buttons {
            width: 100%;
            flex-wrap: wrap;
          }

        }

        @media (max-width: 768px) {

          .tasks-page {
            padding: 20px;
          }

          .tasks-header h1 {
            font-size: 26px;
          }

          .header-buttons {
            width: 100%;
          }

          .dashboard-btn,
          .create-task-btn,
          .view-btn {
            flex: 1;
          }

        }

        .task-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.comments-btn {
  border: 1px solid #ddd6fe;
  background: #f5f3ff;
  color: #7c3aed;
  padding: 8px 13px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.2s;
}

.comments-btn:hover {
  background: #ede9fe;
  transform: translateY(-1px);
}

      `}</style>

    </div>
  );
}

export default Tasks;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1";

function CreateTask() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    due_date: "",
    assigned_to_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.title.trim()) {
      setError("Task title is required.");
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Your session has expired. Please login again.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date || null,
        assigned_to_id: formData.assigned_to_id
          ? Number(formData.assigned_to_id)
          : null,
      };

      await axios.post(`${API_URL}/tasks`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setSuccess("Task created successfully!");

      setTimeout(() => {
        navigate("/tasks");
      }, 700);
    } catch (err) {
      console.error("Create Task Error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        setError("Session expired. Please login again.");

        setTimeout(() => {
          navigate("/login");
        }, 1000);

        return;
      }

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map((item) => item?.msg || "Validation error")
            .join(", ")
        );
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Failed to create task. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>WORKFLOW</div>

          <h1 style={styles.title}>Create Task</h1>

          <p style={styles.subtitle}>
            Add a new task to your workflow
          </p>
        </div>

        <button
          type="button"
          style={styles.dashboardButton}
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </div>

      {/* MAIN CARD */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardIcon}>✓</div>

          <div>
            <h2 style={styles.cardTitle}>Task Details</h2>

            <p style={styles.cardSubtitle}>
              Fill in the information below to create your task.
            </p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div style={styles.error}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div style={styles.success}>
            <span>✓</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* TITLE */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Task Title
              <span style={styles.required}> *</span>
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Prepare monthly sales report"
              style={styles.input}
              disabled={loading}
            />
          </div>

          {/* DESCRIPTION */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what needs to be done..."
              style={styles.textarea}
              disabled={loading}
            />
          </div>

          {/* STATUS + PRIORITY */}
          <div style={styles.row}>
            <div style={styles.half}>
              <label style={styles.label}>Status</label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.input}
                disabled={loading}
              >
                <option value="todo">TODO</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div style={styles.half}>
              <label style={styles.label}>Priority</label>

              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                style={styles.input}
                disabled={loading}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* DATE + USER */}
          <div style={styles.row}>
            <div style={styles.half}>
              <label style={styles.label}>Due Date</label>

              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                style={styles.input}
                disabled={loading}
              />
            </div>

            <div style={styles.half}>
              <label style={styles.label}>
                Assigned User ID
              </label>

              <input
                type="number"
                name="assigned_to_id"
                value={formData.assigned_to_id}
                onChange={handleChange}
                placeholder="e.g. 2"
                min="1"
                style={styles.input}
                disabled={loading}
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div style={styles.actions}>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={() => navigate("/tasks")}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                ...styles.createButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span style={styles.spinner}></span>
                  Creating...
                </>
              ) : (
                <>＋ Create Task</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* FOOTER */}
      <div style={styles.note}>
        🔒 Your task will be securely saved to the workflow system.
      </div>

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 700px) {
            .create-task-page-row {
              flex-direction: column;
            }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f5f7fb 0%, #eef4ff 100%)",
    padding: "40px 35px",
    boxSizing: "border-box",
  },

  header: {
    maxWidth: "960px",
    margin: "0 auto 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
  },

  eyebrow: {
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "2px",
    marginBottom: "7px",
  },

  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: "36px",
    fontWeight: "800",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "15px",
  },

  dashboardButton: {
    border: "1px solid #dbe3ef",
    background: "#ffffff",
    color: "#1e40af",
    padding: "12px 18px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(15,23,42,0.05)",
  },

  card: {
    maxWidth: "960px",
    margin: "0 auto",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "34px",
    boxSizing: "border-box",
    boxShadow: "0 12px 40px rgba(15,23,42,0.08)",
    border: "1px solid #e8edf5",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "28px",
    paddingBottom: "22px",
    borderBottom: "1px solid #edf1f6",
  },

  cardIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800",
  },

  cardTitle: {
    margin: 0,
    color: "#172033",
    fontSize: "20px",
    fontWeight: "800",
  },

  cardSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  formGroup: {
    marginBottom: "22px",
  },

  label: {
    display: "block",
    marginBottom: "9px",
    color: "#334155",
    fontSize: "14px",
    fontWeight: "700",
  },

  required: {
    color: "#ef4444",
  },

  input: {
    width: "100%",
    height: "50px",
    padding: "0 15px",
    border: "1px solid #d7dee8",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#172033",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    minHeight: "125px",
    padding: "14px 15px",
    border: "1px solid #d7dee8",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#172033",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical",
    fontFamily: "inherit",
  },

  row: {
    display: "flex",
    gap: "22px",
    marginBottom: "22px",
  },

  half: {
    flex: 1,
    minWidth: 0,
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    borderTop: "1px solid #edf1f6",
    paddingTop: "24px",
    marginTop: "8px",
  },

  cancelButton: {
    padding: "12px 22px",
    border: "1px solid #d7dee8",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#475569",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },

  createButton: {
    padding: "12px 24px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 5px 15px rgba(37,99,235,0.22)",
  },

  spinner: {
    width: "15px",
    height: "15px",
    border: "2px solid rgba(255,255,255,0.4)",
    borderTop: "2px solid #ffffff",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },

  error: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#be123c",
    padding: "13px 15px",
    borderRadius: "10px",
    marginBottom: "22px",
    fontSize: "14px",
    fontWeight: "600",
  },

  success: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    background: "#ecfdf5",
    border: "1px solid #bbf7d0",
    color: "#15803d",
    padding: "13px 15px",
    borderRadius: "10px",
    marginBottom: "22px",
    fontSize: "14px",
    fontWeight: "600",
  },

  note: {
    maxWidth: "960px",
    margin: "18px auto 0",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "12px",
  },
};

export default CreateTask;
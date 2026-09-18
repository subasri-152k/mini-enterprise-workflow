import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1";

function EditTask() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    due_date: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/tasks/${taskId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const task = response.data;

        setFormData({
          title: task?.title || "",
          description: task?.description || "",
          status: task?.status || "pending",
          priority: task?.priority || "medium",
          due_date: task?.due_date
            ? String(task.due_date).substring(0, 10)
            : "",
        });
      } catch (err) {
        console.error("Fetch Task Error:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
          return;
        }

        setError(
          err.response?.data?.detail ||
            "Failed to load task."
        );
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchTask();
    } else {
      setError("Task ID is missing.");
      setLoading(false);
    }
  }, [taskId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!formData.title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date || null,
      };

      await axios.put(
        `${API_URL}/tasks/${taskId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      navigate("/tasks");
    } catch (err) {
      console.error("Update Task Error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      if (err.response?.status === 405) {
        setError(
          "Backend does not allow PUT for updating tasks. Please check the task update endpoint in Swagger."
        );
        return;
      }

      if (err.response?.status === 422) {
        const detail = err.response.data?.detail;

        if (Array.isArray(detail)) {
          setError(
            detail
              .map((item) => item.msg)
              .join(", ")
          );
        } else {
          setError(
            detail || "Invalid task data."
          );
        }

        return;
      }

      setError(
        err.response?.data?.detail ||
          "Failed to update task."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loader}></div>
        <p style={styles.loadingText}>
          Loading task...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <div style={styles.eyebrow}>
            WORKFLOW
          </div>

          <h1 style={styles.pageTitle}>
            Edit Task
          </h1>

          <p style={styles.subtitle}>
            Update task details and save your changes
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

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>
              Task Details
            </h2>

            <p style={styles.cardSubtitle}>
              Make the required changes below.
            </p>
          </div>

          <div style={styles.taskBadge}>
            #{taskId}
          </div>
        </div>

        {error && (
          <div style={styles.error}>
            <strong>Something went wrong</strong>
            <div style={styles.errorText}>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Task Title
              <span style={styles.required}>
                *
              </span>
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              rows={5}
              style={styles.textarea}
            />
          </div>

          <div style={styles.row}>
            <div style={styles.half}>
              <label style={styles.label}>
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="pending">
                  Pending
                </option>

                <option value="in_progress">
                  In Progress
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>
            </div>

            <div style={styles.half}>
              <label style={styles.label}>
                Priority
              </label>

              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>

                <option value="urgent">
                  Urgent
                </option>
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Due Date
            </label>

            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => navigate("/tasks")}
              style={styles.cancelButton}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.saveButton,
                ...(saving
                  ? styles.disabledButton
                  : {}),
              }}
            >
              {saving
                ? "Saving..."
                : "✓ Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f8fafc 0%, #eef4ff 100%)",
    padding: "40px 36px",
    boxSizing: "border-box",
  },

  topBar: {
    maxWidth: "1000px",
    margin: "0 auto 30px",
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
    marginBottom: "8px",
  },

  pageTitle: {
    margin: 0,
    fontSize: "36px",
    fontWeight: "800",
    color: "#111827",
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
    fontWeight: "700",
    cursor: "pointer",
    boxShadow:
      "0 4px 12px rgba(15,23,42,0.05)",
  },

  card: {
    maxWidth: "1000px",
    margin: "0 auto",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "34px",
    boxSizing: "border-box",
    boxShadow:
      "0 12px 40px rgba(15,23,42,0.08)",
    border: "1px solid #edf1f7",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "21px",
    color: "#111827",
  },

  cardSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  taskBadge: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "800",
  },

  formGroup: {
    marginBottom: "22px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    color: "#334155",
    fontSize: "14px",
    fontWeight: "700",
  },

  required: {
    color: "#ef4444",
    marginLeft: "4px",
  },

  input: {
    width: "100%",
    height: "50px",
    padding: "0 15px",
    boxSizing: "border-box",
    border: "1px solid #d7dee9",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#1f2937",
    fontSize: "15px",
    outline: "none",
  },

  textarea: {
    width: "100%",
    padding: "14px 15px",
    boxSizing: "border-box",
    border: "1px solid #d7dee9",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#1f2937",
    fontSize: "15px",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: "1.5",
  },

  row: {
    display: "flex",
    gap: "20px",
    marginBottom: "22px",
  },

  half: {
    flex: 1,
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "30px",
    paddingTop: "24px",
    borderTop: "1px solid #e5e7eb",
  },

  cancelButton: {
    padding: "12px 22px",
    border: "1px solid #d7dee9",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#475569",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },

  saveButton: {
    padding: "12px 24px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow:
      "0 5px 15px rgba(37,99,235,0.25)",
  },

  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  error: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#be123c",
    padding: "14px 16px",
    borderRadius: "10px",
    marginBottom: "22px",
    fontSize: "14px",
  },

  errorText: {
    marginTop: "5px",
  },

  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#f8fafc",
  },

  loader: {
    width: "38px",
    height: "38px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    animation: "editTaskSpin 0.8s linear infinite",
  },

  loadingText: {
    marginTop: "14px",
    color: "#64748b",
    fontSize: "14px",
  },
};

export default EditTask;
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API_URL}/auth/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      console.error("Registration error:", err);

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(detail.map((item) => item.msg).join(", "));
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      {/* Decorative background */}
      <div style={styles.circleOne}></div>
      <div style={styles.circleTwo}></div>

      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>
            ✓
          </div>

          <h1 style={styles.title}>
            Create Account
          </h1>

          <p style={styles.subtitle}>
            Join Mini Enterprise Workflow
          </p>
        </div>

        {/* Welcome message */}
        <div style={styles.welcomeBox}>
          <div style={styles.welcomeIcon}>✦</div>

          <div>
            <div style={styles.welcomeTitle}>
              Start your journey today!
            </div>

            <div style={styles.welcomeText}>
              Create your account to get started
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.error}>
            <span>⚠</span>
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={styles.success}>
            <span>✓</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Full Name */}
          <div style={styles.field}>
            <label style={styles.label}>
              Full Name
            </label>

            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>👤</span>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                style={styles.input}
                autoComplete="name"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div style={styles.field}>
            <label style={styles.label}>
              Email
            </label>

            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>✉</span>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                style={styles.input}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div style={styles.field}>
            <label style={styles.label}>
              Password
            </label>

            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔒</span>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                style={styles.input}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {/* Role */}
          <div style={styles.field}>
            <label style={styles.label}>
              Role
            </label>

            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>♙</span>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="employee">
                  Employee
                </option>

                <option value="manager">
                  Manager
                </option>

                <option value="admin">
                  Admin
                </option>
              </select>

              <span style={styles.arrow}>⌄</span>
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              "Creating Account..."
            ) : (
              <>
                Create Account
                <span style={styles.buttonArrow}>
                  →
                </span>
              </>
            )}
          </button>

        </form>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.line}></div>
          <span style={styles.or}>OR</span>
          <div style={styles.line}></div>
        </div>

        {/* Login */}
        <div style={styles.footer}>
          <span>
            Already have an account?
          </span>

          <Link
            to="/login"
            style={styles.loginLink}
          >
            Login
          </Link>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #eef5ff 0%, #f7f5ff 50%, #eef2ff 100%)",
    padding: "40px 20px",
    boxSizing: "border-box",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  circleOne: {
    position: "absolute",
    width: "380px",
    height: "380px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08))",
    left: "-180px",
    top: "35%",
  },

  circleTwo: {
    position: "absolute",
    width: "450px",
    height: "450px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, rgba(139,92,246,0.10), rgba(59,130,246,0.06))",
    right: "-220px",
    bottom: "-150px",
  },

  card: {
    width: "100%",
    maxWidth: "520px",
    background: "rgba(255,255,255,0.97)",
    borderRadius: "22px",
    padding: "42px 48px",
    boxSizing: "border-box",
    position: "relative",
    zIndex: 2,
    boxShadow:
      "0 25px 70px rgba(31,41,55,0.12)",
    border: "1px solid rgba(255,255,255,0.8)",
  },

  header: {
    textAlign: "center",
    marginBottom: "28px",
  },

  logo: {
    width: "52px",
    height: "52px",
    margin: "0 auto 15px",
    borderRadius: "15px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#ffffff",
    fontSize: "27px",
    fontWeight: "800",
    boxShadow:
      "0 8px 20px rgba(79,70,229,0.25)",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "750",
    letterSpacing: "-0.8px",
    color: "#172554",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "15px",
  },

  welcomeBox: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "15px 17px",
    marginBottom: "25px",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #f5f3ff, #eff6ff)",
    border: "1px solid #e0e7ff",
  },

  welcomeIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "#ffffff",
    fontSize: "20px",
  },

  welcomeTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#312e81",
    marginBottom: "3px",
  },

  welcomeText: {
    fontSize: "12px",
    color: "#64748b",
  },

  field: {
    marginBottom: "19px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    color: "#172554",
    fontSize: "14px",
    fontWeight: "700",
  },

  inputWrapper: {
    position: "relative",
    width: "100%",
    display: "flex",
    alignItems: "center",
  },

  inputIcon: {
    position: "absolute",
    left: "15px",
    zIndex: 2,
    fontSize: "16px",
    color: "#64748b",
    pointerEvents: "none",
  },

  input: {
    width: "100%",
    height: "50px",
    boxSizing: "border-box",
    padding: "0 15px 0 45px",
    border: "1px solid #d7deea",
    borderRadius: "11px",
    background: "#ffffff",
    color: "#172033",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
  },

  select: {
    width: "100%",
    height: "50px",
    boxSizing: "border-box",
    padding: "0 42px 0 45px",
    border: "1px solid #d7deea",
    borderRadius: "11px",
    background: "#ffffff",
    color: "#172033",
    fontSize: "14px",
    outline: "none",
    appearance: "none",
    cursor: "pointer",
  },

  arrow: {
    position: "absolute",
    right: "17px",
    fontSize: "20px",
    color: "#475569",
    pointerEvents: "none",
  },

  button: {
    width: "100%",
    height: "53px",
    marginTop: "5px",
    border: "none",
    borderRadius: "11px",
    background:
      "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow:
      "0 10px 22px rgba(79,70,229,0.25)",
    transition: "all 0.2s ease",
  },

  buttonArrow: {
    marginLeft: "10px",
    fontSize: "18px",
  },

  divider: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    margin: "25px 0 22px",
  },

  line: {
    flex: 1,
    height: "1px",
    background: "#e2e8f0",
  },

  or: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#94a3b8",
  },

  footer: {
    textAlign: "center",
    fontSize: "14px",
    color: "#64748b",
  },

  loginLink: {
    marginLeft: "6px",
    color: "#2563eb",
    fontWeight: "700",
    textDecoration: "none",
  },

  error: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    padding: "12px 14px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "13px",
  },

  success: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#f0fdf4",
    color: "#15803d",
    border: "1px solid #bbf7d0",
    padding: "12px 14px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "13px",
  },
};

export default Register;
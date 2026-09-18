import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const getErrorMessage = (err) => {
    const detail = err.response?.data?.detail;

    // FastAPI validation error
    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          if (item?.msg) {
            return item.msg;
          }

          return "Invalid login data";
        })
        .join(", ");
    }

    // Normal FastAPI error
    if (typeof detail === "string") {
      return detail;
    }

    if (err.response?.status === 422) {
      return "Please enter a valid email and password.";
    }

    if (err.response?.status === 401) {
      return "Invalid email or password";
    }

    return "Unable to sign in. Please try again.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.email.trim() || !form.password.trim()) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(
        form.email.trim(),
        form.password
      );

      if (!data?.access_token) {
        setError("Login failed. Access token was not received.");
        return;
      }

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            🔐
          </div>

          <h1 style={styles.title}>
            Welcome Back
          </h1>

          <p style={styles.subtitle}>
            Sign in to your workspace
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.error}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div style={styles.field}>
            <label style={styles.label}>
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              style={styles.input}
              required
            />
          </div>

          {/* Password */}
          <div style={styles.field}>
            <label style={styles.label}>
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              style={styles.input}
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? (
              "Signing In..."
            ) : (
              <>
                Sign In
                <span style={styles.arrow}>→</span>
              </>
            )}
          </button>

        </form>

        {/* Register Link */}
        <div style={styles.footer}>
          <span>
            Don't have an account?
          </span>{" "}
          <Link
            to="/register"
            style={styles.link}
          >
            Create Account
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
    background:
      "linear-gradient(135deg, #eef4ff 0%, #f8fafc 50%, #eef2ff 100%)",
    padding: "30px 20px",
    boxSizing: "border-box",
  },

  card: {
    width: "100%",
    maxWidth: "460px",
    background: "#ffffff",
    padding: "42px 40px",
    borderRadius: "18px",
    boxShadow:
      "0 20px 50px rgba(30, 64, 175, 0.12)",
    boxSizing: "border-box",
  },

  header: {
    textAlign: "center",
    marginBottom: "30px",
  },

  iconCircle: {
    width: "58px",
    height: "58px",
    margin: "0 auto 16px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, #2563eb, #4f46e5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    boxShadow:
      "0 8px 20px rgba(37, 99, 235, 0.25)",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "700",
    color: "#172033",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    margin: "9px 0 0",
    color: "#64748b",
    fontSize: "15px",
  },

  error: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    padding: "12px 14px",
    borderRadius: "9px",
    marginBottom: "22px",
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: "1.5",
  },

  field: {
    marginBottom: "21px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
  },

  input: {
    width: "100%",
    height: "48px",
    padding: "0 14px",
    border: "1px solid #d5dce7",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#172033",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none",
  },

  button: {
    width: "100%",
    height: "50px",
    border: "none",
    borderRadius: "9px",
    background:
      "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "5px",
    boxShadow:
      "0 7px 18px rgba(37, 99, 235, 0.22)",
    transition: "all 0.2s ease",
  },

  buttonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },

  arrow: {
    marginLeft: "10px",
    fontSize: "19px",
  },

  footer: {
    textAlign: "center",
    marginTop: "27px",
    color: "#64748b",
    fontSize: "14px",
  },

  link: {
    color: "#2563eb",
    fontWeight: "700",
    textDecoration: "none",
    marginLeft: "3px",
  },
};

export default Login;
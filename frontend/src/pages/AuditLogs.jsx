import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/audit-logs/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLogs(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("Audit logs error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load audit logs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleString();
  };

  const formatAction = (action) => {
    if (!action) return "Unknown Action";

    return action
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  return (
    <div className="audit-page">

      {/* HEADER */}
      <div className="audit-header">

        <div>
          <div className="section-label">
            ENTERPRISE
          </div>

          <h1>Audit Logs</h1>

          <p>
            Track important actions and system activity.
          </p>
        </div>

        <div className="audit-icon">
          🛡️
        </div>

      </div>

      {/* ERROR */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* MAIN CARD */}
      <div className="audit-card">

        <div className="audit-card-header">

          <div>
            <span className="heading-label">
              SYSTEM TRACEABILITY
            </span>

            <h2>
              Activity History
            </h2>
          </div>

          <button
            className="refresh-button"
            onClick={fetchAuditLogs}
          >
            ↻ Refresh
          </button>

        </div>

        {/* LOADING */}
        {loading ? (

          <div className="audit-empty">

            <div className="loader"></div>

            <p>
              Loading audit logs...
            </p>

          </div>

        ) : logs.length === 0 ? (

          /* EMPTY */
          <div className="audit-empty">

            <div className="empty-icon">
              📭
            </div>

            <h3>
              No audit logs
            </h3>

            <p>
              System activity will appear here.
            </p>

          </div>

        ) : (

          /* TABLE */
          <div className="table-wrapper">

            <table className="audit-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Entity ID</th>
                  <th>Timestamp</th>
                </tr>
              </thead>

              <tbody>

                {logs.map((log) => (

                  <tr key={log.id}>

                    <td>
                      <span className="log-id">
                        #{log.id}
                      </span>
                    </td>

                    <td>
                      <div className="user-cell">

                        <div className="user-avatar">
                          U
                        </div>

                        <span>
                          User #{log.user_id}
                        </span>

                      </div>
                    </td>

                    <td>
                      <span className="action-badge">
                        {formatAction(log.action)}
                      </span>
                    </td>

                    <td>
                      <span className="entity-name">
                        {log.entity || "N/A"}
                      </span>
                    </td>

                    <td>
                      #{log.entity_id}
                    </td>

                    <td>
                      <span className="timestamp">
                        {formatDate(log.timestamp)}
                      </span>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      <style>{`

        .audit-page {
          min-height: 100vh;
          background: #f4f7fb;
          padding: 45px 36px;
        }

        .audit-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 35px;
        }

        .section-label {
          color: #2563eb;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }

        .audit-header h1 {
          margin: 0;
          color: #111827;
          font-size: 40px;
          font-weight: 800;
        }

        .audit-header p {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 15px;
        }

        .audit-icon {
          width: 52px;
          height: 52px;
          border-radius: 13px;
          background: #eef4ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
        }

        .error-message {
          padding: 13px 16px;
          margin-bottom: 20px;
          border-radius: 9px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-size: 14px;
        }

        .audit-card {
          background: #ffffff;
          border: 1px solid #e0e7ef;
          border-radius: 16px;
          overflow: hidden;
          box-shadow:
            0 6px 25px rgba(15, 23, 42, 0.04);
        }

        .audit-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 30px 35px;
          border-bottom: 1px solid #e5eaf1;
        }

        .heading-label {
          color: #2563eb;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .audit-card-header h2 {
          margin: 7px 0 0;
          color: #172033;
          font-size: 22px;
        }

        .refresh-button {
          border: 1px solid #d7e0ec;
          background: #ffffff;
          color: #2563eb;
          padding: 9px 15px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .refresh-button:hover {
          background: #eff6ff;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .audit-table {
          width: 100%;
          min-width: 850px;
          border-collapse: collapse;
        }

        .audit-table th {
          padding: 14px 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e5eaf1;
          color: #64748b;
          text-align: left;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .audit-table td {
          padding: 17px 24px;
          border-bottom: 1px solid #edf1f5;
          color: #64748b;
          font-size: 13px;
        }

        .audit-table tbody tr:hover {
          background: #f8fbff;
        }

        .log-id {
          color: #2563eb;
          font-weight: 700;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #334155;
          font-weight: 600;
        }

        .user-avatar {
          width: 31px;
          height: 31px;
          border-radius: 50%;
          background: #eef4ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
        }

        .action-badge {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 7px;
          background: #eef4ff;
          color: #2563eb;
          font-size: 11px;
          font-weight: 800;
        }

        .entity-name {
          color: #334155;
          font-weight: 600;
        }

        .timestamp {
          color: #64748b;
          white-space: nowrap;
          font-size: 12px;
        }

        .audit-empty {
          min-height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #94a3b8;
        }

        .empty-icon {
          font-size: 42px;
          margin-bottom: 12px;
        }

        .audit-empty h3 {
          margin: 0;
          color: #475569;
          font-size: 18px;
        }

        .audit-empty p {
          margin: 7px 0 0;
          font-size: 13px;
        }

        .loader {
          width: 35px;
          height: 35px;
          border: 4px solid #dbe4f0;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: auditSpin .8s linear infinite;
          margin-bottom: 14px;
        }

        @keyframes auditSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 700px) {

          .audit-page {
            padding: 25px 18px;
          }

          .audit-header h1 {
            font-size: 32px;
          }

          .audit-card-header {
            padding: 25px 20px;
          }

        }

      `}</style>

    </div>
  );
}

export default AuditLogs;
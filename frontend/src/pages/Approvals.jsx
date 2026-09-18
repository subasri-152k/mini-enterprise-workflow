import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api/v1";

function Approvals() {
  const navigate = useNavigate();

  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [selectedApproval, setSelectedApproval] =
    useState(null);

  const [action, setAction] = useState("");
  const [actionComment, setActionComment] = useState("");
  const [actionLoading, setActionLoading] =
    useState(false);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] =
    useState(false);

  const token = localStorage.getItem("access_token");

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const userRole =
    currentUser?.role?.toLowerCase() || "";

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/approvals/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApprovals(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Approvals API Error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Session expired. Please login again."
        );

        localStorage.removeItem(
          "access_token"
        );
      } else {
        setError(
          err.response?.data?.detail ||
            "Failed to load approvals."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchApprovals();
  }, []);

  const createApproval = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setError("Approval title is required.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      await axios.post(
        `${API_URL}/approvals/`,
        {
          title: title.trim(),
          description:
            description.trim() || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTitle("");
      setDescription("");
      setShowCreate(false);

      await fetchApprovals();
    } catch (err) {
      console.error(
        "Create Approval Error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to create approval."
      );
    } finally {
      setCreating(false);
    }
  };

  const openActionModal = (approval) => {
    setSelectedApproval(approval);
    setAction("");
    setActionComment("");
    setError("");
  };

  const closeActionModal = () => {
    setSelectedApproval(null);
    setAction("");
    setActionComment("");
  };

  const submitAction = async () => {
    if (!action) {
      setError("Please select an action.");
      return;
    }

    if (
      action === "reject" &&
      !actionComment.trim()
    ) {
      setError(
        "Comment is mandatory when rejecting an approval."
      );
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await axios.patch(
        `${API_URL}/approvals/${selectedApproval.id}/action`,
        {
          action,
          comment:
            actionComment.trim() || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      closeActionModal();

      await fetchApprovals();
    } catch (err) {
      console.error(
        "Approval Action Error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to perform approval action."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openHistory = async (approval) => {
    setSelectedApproval(approval);
    setHistory([]);
    setHistoryLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_URL}/approvals/${approval.id}/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHistory(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Approval History Error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load approval history."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "approval-status approved";

      case "rejected":
        return "approval-status rejected";

      case "on_hold":
        return "approval-status hold";

      case "pending":
      default:
        return "approval-status pending";
    }
  };

  const formatStatus = (status) => {
    return String(status || "")
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (char) => char.toUpperCase()
      );
  };

  const formatLevel = (level) => {
    return String(level || "")
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (char) => char.toUpperCase()
      );
  };

  return (
    <div className="approvals-page">

      {/* HEADER */}
      <div className="approvals-header">

        <div>
          <p className="approval-eyebrow">
            WORKFLOW
          </p>

          <h1>Approvals</h1>

          <p>
            Manage and track approval requests
          </p>
        </div>

        <div className="header-actions">

          <button
            className="back-btn"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Dashboard
          </button>

          {userRole === "employee" && (
            <button
              className="create-approval-btn"
              onClick={() =>
                setShowCreate(true)
              }
            >
              + New Request
            </button>
          )}

        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="approval-error">
          <strong>Error</strong>
          <p>{error}</p>

          <button
            onClick={() => setError("")}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* CREATE APPROVAL */}
      {showCreate && (
        <div className="modal-overlay">

          <div className="approval-modal">

            <div className="modal-header">
              <div>
                <h2>
                  New Approval Request
                </h2>

                <p>
                  Submit a request for manager
                  and admin approval.
                </p>
              </div>

              <button
                className="close-btn"
                onClick={() =>
                  setShowCreate(false)
                }
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={createApproval}
            >

              <label>
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Enter approval title"
              />

              <label>
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Describe your request..."
                rows={5}
              />

              <div className="modal-buttons">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    setShowCreate(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={creating}
                >
                  {creating
                    ? "Submitting..."
                    : "Submit Request"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* LOADING */}
      {loading ? (

        <div className="approval-loading">
          <div className="loader"></div>
          <p>
            Loading approval requests...
          </p>
        </div>

      ) : (

        <div className="approval-card">

          {approvals.length === 0 ? (

            <div className="empty-approvals">

              <div className="empty-icon">
                📄
              </div>

              <h2>
                No approval requests
              </h2>

              <p>
                There are currently no approval
                requests to display.
              </p>

              {userRole === "employee" && (
                <button
                  className="create-empty-btn"
                  onClick={() =>
                    setShowCreate(true)
                  }
                >
                  + Create Request
                </button>
              )}

            </div>

          ) : (

            <div className="approval-table-wrapper">

              <table className="approval-table">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Requested By</th>
                    <th>Status</th>
                    <th>Current Level</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {approvals.map(
                    (approval) => (

                      <tr key={approval.id}>

                        <td>
                          <span className="approval-id">
                            #{approval.id}
                          </span>
                        </td>

                        <td>
                          <div className="approval-title">
                            {approval.title}
                          </div>

                          {approval.description && (
                            <div className="approval-description">
                              {approval.description}
                            </div>
                          )}
                        </td>

                        <td>
                          User #
                          {approval.requested_by}
                        </td>

                        <td>
                          <span
                            className={getStatusClass(
                              approval.status
                            )}
                          >
                            {formatStatus(
                              approval.status
                            )}
                          </span>
                        </td>

                        <td>
                          <span className="level-badge">
                            {formatLevel(
                              approval.current_level
                            )}
                          </span>
                        </td>

                        <td>
                          {approval.created_at
                            ? new Date(
                                approval.created_at
                              ).toLocaleString()
                            : "-"}
                        </td>

                        <td>

                          <div className="action-buttons">

                            <button
                              className="history-btn"
                              onClick={() =>
                                openHistory(
                                  approval
                                )
                              }
                            >
                              📜 History
                            </button>

                            {approval.status ===
                              "pending" &&
                              ((userRole ===
                                "manager" &&
                                approval.current_level ===
                                  "manager") ||
                                (userRole ===
                                  "admin" &&
                                  approval.current_level ===
                                    "admin")) && (

                                <button
                                  className="action-btn"
                                  onClick={() =>
                                    openActionModal(
                                      approval
                                    )
                                  }
                                >
                                  ⚡ Action
                                </button>

                              )}

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      )}

      {/* ACTION MODAL */}
      {selectedApproval &&
        !historyLoading &&
        history.length === 0 &&
        selectedApproval.status ===
          "pending" &&
        ((userRole === "manager" &&
          selectedApproval.current_level ===
            "manager") ||
          (userRole === "admin" &&
            selectedApproval.current_level ===
              "admin")) && (

          <div className="modal-overlay">

            <div className="approval-modal">

              <div className="modal-header">

                <div>
                  <p className="modal-eyebrow">
                    APPROVAL #
                    {selectedApproval.id}
                  </p>

                  <h2>
                    Take Action
                  </h2>

                  <p>
                    {selectedApproval.title}
                  </p>
                </div>

                <button
                  className="close-btn"
                  onClick={
                    closeActionModal
                  }
                >
                  ✕
                </button>

              </div>

              <label>
                Action
              </label>

              <div className="action-options">

                <button
                  className={
                    action === "approve"
                      ? "action-option selected approve"
                      : "action-option approve"
                  }
                  onClick={() =>
                    setAction("approve")
                  }
                >
                  ✅ Approve
                </button>

                <button
                  className={
                    action === "reject"
                      ? "action-option selected reject"
                      : "action-option reject"
                  }
                  onClick={() =>
                    setAction("reject")
                  }
                >
                  ❌ Reject
                </button>

                <button
                  className={
                    action === "hold"
                      ? "action-option selected hold"
                      : "action-option hold"
                  }
                  onClick={() =>
                    setAction("hold")
                  }
                >
                  ⏸️ Hold
                </button>

              </div>

              <label>
                Comment
                {action === "reject" && (
                  <span className="required">
                    {" "}
                    * Required
                  </span>
                )}
              </label>

              <textarea
                value={actionComment}
                onChange={(event) =>
                  setActionComment(
                    event.target.value
                  )
                }
                placeholder={
                  action === "reject"
                    ? "Enter rejection reason..."
                    : "Add an optional comment..."
                }
                rows={4}
              />

              <div className="modal-buttons">

                <button
                  className="cancel-btn"
                  onClick={
                    closeActionModal
                  }
                >
                  Cancel
                </button>

                <button
                  className="submit-btn"
                  onClick={submitAction}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Processing..."
                    : "Submit Action"}
                </button>

              </div>

            </div>

          </div>
        )}

      {/* HISTORY MODAL */}
      {selectedApproval &&
        (historyLoading ||
          history.length > 0 ||
          selectedApproval.status !==
            "pending") && (

          <div className="modal-overlay">

            <div className="history-modal">

              <div className="modal-header">

                <div>
                  <p className="modal-eyebrow">
                    APPROVAL #
                    {selectedApproval.id}
                  </p>

                  <h2>
                    Approval History
                  </h2>

                  <p>
                    {selectedApproval.title}
                  </p>
                </div>

                <button
                  className="close-btn"
                  onClick={
                    closeActionModal
                  }
                >
                  ✕
                </button>

              </div>

              {historyLoading ? (

                <div className="history-loading">
                  Loading history...
                </div>

              ) : history.length === 0 ? (

                <div className="history-empty">
                  No actions have been recorded
                  yet.
                </div>

              ) : (

                <div className="timeline">

                  {history.map(
                    (item) => (

                      <div
                        className="timeline-item"
                        key={item.id}
                      >

                        <div className="timeline-dot">
                          ✓
                        </div>

                        <div className="timeline-content">

                          <div className="timeline-top">

                            <strong>
                              {formatStatus(
                                item.action
                              )}
                            </strong>

                            <span>
                              User #
                              {item.action_by}
                            </span>

                          </div>

                          {item.comment && (
                            <p>
                              {item.comment}
                            </p>
                          )}

                          <small>
                            {item.created_at
                              ? new Date(
                                  item.created_at
                                ).toLocaleString()
                              : "-"}
                          </small>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          </div>
        )}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .approvals-page {
          min-height: 100vh;
          background: #f5f7fb;
          padding: 35px;
        }

        .approvals-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .approval-eyebrow,
        .modal-eyebrow {
          margin: 0 0 7px;
          color: #2563eb;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .approvals-header h1 {
          margin: 0;
          color: #111827;
          font-size: 34px;
        }

        .approvals-header p {
          margin: 8px 0 0;
          color: #6b7280;
          font-size: 15px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .back-btn {
          border: 1px solid #d5dce6;
          background: white;
          color: #334155;
          padding: 13px 19px;
          border-radius: 9px;
          font-weight: 600;
          cursor: pointer;
        }

        .create-approval-btn,
        .submit-btn {
          border: none;
          background: #2563eb;
          color: white;
          padding: 13px 20px;
          border-radius: 9px;
          font-weight: 600;
          cursor: pointer;
        }

        .create-approval-btn:hover,
        .submit-btn:hover {
          background: #1d4ed8;
        }

        .approval-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow:
            0 5px 25px
            rgba(0, 0, 0, 0.06);
        }

        .approval-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .approval-table {
          width: 100%;
          min-width: 1000px;
          border-collapse: collapse;
        }

        .approval-table thead {
          background: #f8fafc;
        }

        .approval-table th {
          text-align: left;
          padding: 16px 18px;
          border-bottom:
            1px solid #e5e7eb;
          color: #64748b;
          font-size: 12px;
          text-transform: uppercase;
        }

        .approval-table td {
          padding: 17px 18px;
          border-bottom:
            1px solid #f1f5f9;
          color: #374151;
          font-size: 13px;
        }

        .approval-id {
          color: #64748b;
          font-weight: 700;
        }

        .approval-title {
          color: #111827;
          font-weight: 700;
        }

        .approval-description {
          margin-top: 5px;
          max-width: 250px;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .approval-status {
          display: inline-flex;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .approval-status.pending {
          background: #fff7ed;
          color: #c2410c;
        }

        .approval-status.approved {
          background: #ecfdf5;
          color: #047857;
        }

        .approval-status.rejected {
          background: #fef2f2;
          color: #b91c1c;
        }

        .approval-status.hold {
          background: #fefce8;
          color: #a16207;
        }

        .level-badge {
          background: #eef2ff;
          color: #4338ca;
          padding: 5px 9px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
        }

        .action-buttons {
          display: flex;
          gap: 7px;
        }

        .history-btn,
        .action-btn {
          border-radius: 7px;
          padding: 8px 11px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .history-btn {
          border: 1px solid #cbd5e1;
          background: white;
          color: #475569;
        }

        .action-btn {
          border: 1px solid #bfdbfe;
          background: #eff6ff;
          color: #1d4ed8;
        }

        .empty-approvals {
          text-align: center;
          padding: 80px 25px;
        }

        .empty-icon {
          font-size: 50px;
          margin-bottom: 15px;
        }

        .empty-approvals h2 {
          margin: 0;
          color: #111827;
        }

        .empty-approvals p {
          color: #6b7280;
          margin: 10px 0 25px;
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

        .approval-loading {
          background: white;
          border-radius: 15px;
          padding: 60px;
          text-align: center;
          color: #64748b;
        }

        .loader {
          width: 35px;
          height: 35px;
          border: 4px solid #e5e7eb;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 15px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .approval-error {
          margin-bottom: 20px;
          padding: 15px;
          border-radius: 10px;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
        }

        .approval-error p {
          margin: 6px 0 10px;
        }

        .approval-error button {
          border: none;
          background: #be123c;
          color: white;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
        }

        /* MODALS */

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          z-index: 1000;
        }

        .approval-modal,
        .history-modal {
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 16px;
          padding: 25px;
          box-shadow:
            0 20px 60px
            rgba(0, 0, 0, 0.2);
        }

        .history-modal {
          max-width: 650px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 25px;
        }

        .modal-header h2 {
          margin: 0;
          color: #111827;
        }

        .modal-header p {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .close-btn {
          border: none;
          background: #f1f5f9;
          color: #475569;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          cursor: pointer;
        }

        .approval-modal label {
          display: block;
          margin: 15px 0 7px;
          color: #374151;
          font-size: 13px;
          font-weight: 700;
        }

        .approval-modal input,
        .approval-modal textarea {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 11px;
          font-family: inherit;
          outline: none;
        }

        .approval-modal input:focus,
        .approval-modal textarea:focus {
          border-color: #2563eb;
        }

        .modal-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 22px;
        }

        .cancel-btn {
          border: 1px solid #cbd5e1;
          background: white;
          color: #475569;
          padding: 11px 17px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .action-options {
          display: flex;
          gap: 10px;
        }

        .action-option {
          flex: 1;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          background: white;
        }

        .action-option.approve {
          border: 1px solid #86efac;
          color: #15803d;
        }

        .action-option.reject {
          border: 1px solid #fca5a5;
          color: #b91c1c;
        }

        .action-option.hold {
          border: 1px solid #fde68a;
          color: #a16207;
        }

        .action-option.selected.approve {
          background: #dcfce7;
        }

        .action-option.selected.reject {
          background: #fee2e2;
        }

        .action-option.selected.hold {
          background: #fef3c7;
        }

        .required {
          color: #dc2626;
        }

        /* HISTORY */

        .history-loading,
        .history-empty {
          text-align: center;
          padding: 40px;
          color: #64748b;
        }

        .timeline {
          position: relative;
          padding-left: 25px;
        }

        .timeline::before {
          content: "";
          position: absolute;
          left: 7px;
          top: 5px;
          bottom: 5px;
          width: 2px;
          background: #e2e8f0;
        }

        .timeline-item {
          position: relative;
          display: flex;
          gap: 15px;
          margin-bottom: 25px;
        }

        .timeline-dot {
          position: absolute;
          left: -25px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #2563eb;
          color: white;
          font-size: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .timeline-content {
          flex: 1;
          padding: 13px;
          background: #f8fafc;
          border-radius: 9px;
        }

        .timeline-top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .timeline-top strong {
          color: #334155;
        }

        .timeline-top span {
          color: #64748b;
          font-size: 12px;
        }

        .timeline-content p {
          margin: 8px 0;
          color: #475569;
          font-size: 13px;
        }

        .timeline-content small {
          color: #94a3b8;
          font-size: 11px;
        }

        @media (max-width: 768px) {

          .approvals-page {
            padding: 20px;
          }

          .approvals-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }

          .header-actions {
            width: 100%;
          }

          .back-btn,
          .create-approval-btn {
            flex: 1;
          }

          .action-options {
            flex-direction: column;
          }

        }

      `}</style>

    </div>
  );
}

export default Approvals;
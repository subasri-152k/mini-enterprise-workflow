import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1";

function Documents() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // =========================================================
  // LOAD TASKS
  // =========================================================

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoadingTasks(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/tasks`,
          authConfig
        );

        const taskData = Array.isArray(response.data)
          ? response.data
          : [];

        setTasks(taskData);
      } catch (err) {
        console.error("Tasks error:", err);

        setError(
          err.response?.data?.detail ||
            "Failed to load tasks."
        );
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, []);

  // =========================================================
  // LOAD DOCUMENTS FOR TASK
  // =========================================================

  const fetchDocuments = async (taskId) => {
    if (!taskId) {
      setDocuments([]);
      return;
    }

    try {
      setLoadingDocuments(true);
      setError("");
      setMessage("");

      const response = await axios.get(
        `${API_URL}/documents/task/${taskId}`,
        authConfig
      );

      setDocuments(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("Documents error:", err);

      setDocuments([]);

      setError(
        err.response?.data?.detail ||
          "Failed to load documents."
      );
    } finally {
      setLoadingDocuments(false);
    }
  };

  // =========================================================
  // TASK CHANGE
  // =========================================================

  const handleTaskChange = (e) => {
    const taskId = e.target.value;

    setSelectedTask(taskId);
    setSelectedFile(null);
    setMessage("");
    setError("");

    fetchDocuments(taskId);
  };

  // =========================================================
  // FILE CHANGE
  // =========================================================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    setMessage("");
    setError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSelectedFile(null);
      e.target.value = "";
      setError("File size must not exceed 10 MB.");
      return;
    }

    setSelectedFile(file);
  };

  // =========================================================
  // UPLOAD DOCUMENT
  // =========================================================

  const handleUpload = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!selectedTask) {
      setError("Please select a task.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a file.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("file", selectedFile);

      await axios.post(
        `${API_URL}/documents/upload?task_id=${selectedTask}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(
        "Document uploaded successfully."
      );

      setSelectedFile(null);

      const fileInput =
        document.getElementById("document-file");

      if (fileInput) {
        fileInput.value = "";
      }

      await fetchDocuments(selectedTask);
    } catch (err) {
      console.error("Upload error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to upload document."
      );
    } finally {
      setUploading(false);
    }
  };

  // =========================================================
  // DOWNLOAD
  // =========================================================

  const handleDownload = async (documentId, fileName) => {
    try {
      setError("");
      setMessage("");

      const response = await axios.get(
        `${API_URL}/documents/${documentId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blobUrl = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = fileName || "document";

      document.body.appendChild(link);
      link.click();

      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to download document."
      );
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleString();
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="documents-page">

      {/* HEADER */}
      <div className="documents-header">

        <div>
          <div className="section-label">
            ENTERPRISE
          </div>

          <h1>Documents</h1>

          <p>
            Upload, manage and download task documents.
          </p>
        </div>

        <div className="documents-icon">
          📄
        </div>

      </div>

      {/* MESSAGE */}
      {message && (
        <div className="success-message">
          ✅ {message}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* UPLOAD SECTION */}
      <div className="document-upload-card">

        <div className="card-heading">
          <div>
            <span className="heading-label">
              DOCUMENT MANAGEMENT
            </span>

            <h2>Upload Document</h2>

            <p>
              Attach a document to a workflow task.
            </p>
          </div>

          <div className="upload-icon">
            ⬆️
          </div>
        </div>

        <form onSubmit={handleUpload}>

          {/* TASK */}
          <div className="form-group">

            <label>
              Select Task
            </label>

            <select
              value={selectedTask}
              onChange={handleTaskChange}
              disabled={loadingTasks || uploading}
            >
              <option value="">
                {loadingTasks
                  ? "Loading tasks..."
                  : "Select a task"}
              </option>

              {tasks.map((task) => (
                <option
                  key={task.id}
                  value={task.id}
                >
                  #{task.id} - {task.title}
                </option>
              ))}
            </select>

          </div>

          {/* FILE */}
          <div className="form-group">

            <label>
              Select File
            </label>

            <input
              id="document-file"
              type="file"
              onChange={handleFileChange}
              disabled={uploading}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
            />

            <small>
              Supported: PDF, Word, Excel, Images and
              TXT. Maximum size: 10 MB.
            </small>

          </div>

          {/* SELECTED FILE */}
          {selectedFile && (
            <div className="selected-file">

              <span className="selected-file-icon">
                📎
              </span>

              <div>
                <strong>
                  {selectedFile.name}
                </strong>

                <span>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)}
                  {" "}MB
                </span>
              </div>

            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="upload-button"
          >
            {uploading
              ? "Uploading..."
              : "⬆️ Upload Document"}
          </button>

        </form>

      </div>

      {/* DOCUMENT LIST */}
      <div className="document-list-card">

        <div className="list-header">

          <div>
            <span className="heading-label">
              VERSION CONTROL
            </span>

            <h2>Task Documents</h2>
          </div>

          {selectedTask && (
            <span className="document-count">
              {documents.length} document
              {documents.length !== 1 ? "s" : ""}
            </span>
          )}

        </div>

        {!selectedTask ? (

          <div className="empty-state">

            <div className="empty-icon">
              📂
            </div>

            <h3>
              Select a task
            </h3>

            <p>
              Choose a task above to view its documents.
            </p>

          </div>

        ) : loadingDocuments ? (

          <div className="empty-state">

            <div className="loader"></div>

            <p>
              Loading documents...
            </p>

          </div>

        ) : documents.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              📭
            </div>

            <h3>
              No documents
            </h3>

            <p>
              No documents have been uploaded for this
              task yet.
            </p>

          </div>

        ) : (

          <div className="document-table-wrapper">

            <table className="document-table">

              <thead>
                <tr>
                  <th>Document</th>
                  <th>Version</th>
                  <th>Uploaded By</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {documents.map((document) => (

                  <tr key={document.id}>

                    <td>

                      <div className="file-info">

                        <div className="file-icon">
                          📄
                        </div>

                        <div>
                          <strong>
                            {document.file_name}
                          </strong>

                          <span>
                            Document #{document.id}
                          </span>
                        </div>

                      </div>

                    </td>

                    <td>
                      <span className="version-badge">
                        v{document.version}
                      </span>
                    </td>

                    <td>
                      User #{document.uploaded_by}
                    </td>

                    <td>
                      {formatDate(
                        document.created_at
                      )}
                    </td>

                    <td>

                      <button
                        className="download-button"
                        onClick={() =>
                          handleDownload(
                            document.id,
                            document.file_name
                          )
                        }
                      >
                        📥 Download
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      <style>{`

        .documents-page {
          min-height: 100vh;
          background: #f4f7fb;
          padding: 45px 36px;
        }

        .documents-header {
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

        .documents-header h1 {
          margin: 0;
          color: #111827;
          font-size: 40px;
          font-weight: 800;
        }

        .documents-header p {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 15px;
        }

        .documents-icon {
          width: 52px;
          height: 52px;
          border-radius: 13px;
          background: #eef4ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
        }

        .success-message,
        .error-message {
          padding: 13px 16px;
          border-radius: 9px;
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        .success-message {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #047857;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }

        .document-upload-card,
        .document-list-card {
          background: #ffffff;
          border: 1px solid #e0e7ef;
          border-radius: 16px;
          box-shadow:
            0 6px 25px rgba(15, 23, 42, 0.04);
          margin-bottom: 25px;
        }

        .document-upload-card {
          padding: 30px 35px;
        }

        .card-heading,
        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
        }

        .heading-label {
          color: #2563eb;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .card-heading h2,
        .list-header h2 {
          margin: 7px 0 0;
          color: #172033;
          font-size: 22px;
        }

        .card-heading p {
          margin: 6px 0 0;
          color: #94a3b8;
          font-size: 13px;
        }

        .upload-icon {
          width: 45px;
          height: 45px;
          border-radius: 11px;
          background: #eef4ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #334155;
          font-size: 14px;
          font-weight: 700;
        }

        .form-group select,
        .form-group input[type="file"] {
          width: 100%;
          min-height: 48px;
          border: 1px solid #d5dce7;
          border-radius: 9px;
          background: #ffffff;
          padding: 12px 14px;
          color: #334155;
          font-size: 14px;
          box-sizing: border-box;
        }

        .form-group select:focus {
          outline: none;
          border-color: #2563eb;
        }

        .form-group small {
          display: block;
          margin-top: 7px;
          color: #94a3b8;
          font-size: 12px;
        }

        .selected-file {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 15px;
          margin-bottom: 20px;
          border-radius: 9px;
          background: #f8fbff;
          border: 1px solid #dbeafe;
        }

        .selected-file-icon {
          font-size: 22px;
        }

        .selected-file strong {
          display: block;
          color: #334155;
          font-size: 13px;
          word-break: break-all;
        }

        .selected-file span:last-child {
          display: block;
          color: #94a3b8;
          font-size: 11px;
          margin-top: 3px;
        }

        .upload-button {
          border: none;
          background: #2563eb;
          color: #ffffff;
          padding: 12px 20px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .upload-button:hover {
          background: #1d4ed8;
        }

        .upload-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .document-list-card {
          overflow: hidden;
        }

        .list-header {
          padding: 30px 35px 25px;
          margin: 0;
        }

        .document-count {
          padding: 7px 12px;
          background: #eef4ff;
          color: #2563eb;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }

        .document-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .document-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 760px;
        }

        .document-table th {
          padding: 13px 25px;
          background: #f8fafc;
          border-top: 1px solid #e5eaf1;
          border-bottom: 1px solid #e5eaf1;
          color: #64748b;
          text-align: left;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .document-table td {
          padding: 17px 25px;
          border-bottom: 1px solid #edf1f5;
          color: #64748b;
          font-size: 13px;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .file-icon {
          width: 40px;
          height: 40px;
          border-radius: 9px;
          background: #eef4ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .file-info strong {
          display: block;
          max-width: 220px;
          color: #172033;
          font-size: 13px;
          word-break: break-word;
        }

        .file-info span {
          display: block;
          margin-top: 3px;
          color: #94a3b8;
          font-size: 11px;
        }

        .version-badge {
          display: inline-block;
          padding: 5px 9px;
          border-radius: 6px;
          background: #eef4ff;
          color: #2563eb;
          font-size: 12px;
          font-weight: 800;
        }

        .download-button {
          border: 1px solid #d7e0ec;
          background: #ffffff;
          color: #2563eb;
          padding: 8px 12px;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .download-button:hover {
          background: #eff6ff;
        }

        .empty-state {
          min-height: 280px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px;
          color: #94a3b8;
          border-top: 1px solid #edf1f5;
        }

        .empty-icon {
          font-size: 40px;
          margin-bottom: 12px;
        }

        .empty-state h3 {
          margin: 0;
          color: #475569;
          font-size: 17px;
        }

        .empty-state p {
          margin: 7px 0 0;
          font-size: 13px;
        }

        .loader {
          width: 34px;
          height: 34px;
          border: 4px solid #dbe4f0;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: documentSpin 0.8s linear infinite;
          margin-bottom: 14px;
        }

        @keyframes documentSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 700px) {

          .documents-page {
            padding: 25px 18px;
          }

          .documents-header h1 {
            font-size: 32px;
          }

          .document-upload-card {
            padding: 25px 20px;
          }

          .list-header {
            padding: 25px 20px;
          }

        }

      `}</style>
    </div>
  );
}

export default Documents;
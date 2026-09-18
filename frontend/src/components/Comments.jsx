import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1";

function Comments({ taskId, onClose }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/tasks/${taskId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("Comments API Error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load comments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
  }, [taskId]);

  const addComment = async (event) => {
    event.preventDefault();

    if (!content.trim()) {
      setError("Comment cannot be empty.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await axios.post(
        `${API_URL}/tasks/${taskId}/comments`,
        {
          content: content.trim(),
          is_internal: isInternal,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments((previous) => [
        response.data,
        ...previous,
      ]);

      setContent("");
      setIsInternal(false);
    } catch (err) {
      console.error("Add Comment Error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to add comment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comments-overlay">

      <div className="comments-modal">

        {/* HEADER */}
        <div className="comments-header">

          <div>
            <p className="comments-eyebrow">
              TASK #{taskId}
            </p>

            <h2>Comments</h2>

            <p>
              Discussion and updates for this task
            </p>
          </div>

          <button
            className="comments-close-btn"
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        {/* ERROR */}
        {error && (
          <div className="comments-error">
            {error}
          </div>
        )}

        {/* ADD COMMENT */}
        <form
          className="comment-form"
          onSubmit={addComment}
        >

          <textarea
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            placeholder="Write a comment..."
            rows={4}
          />

          <div className="comment-form-footer">

            <label className="internal-option">

              <input
                type="checkbox"
                checked={isInternal}
                onChange={(event) =>
                  setIsInternal(event.target.checked)
                }
              />

              <span>
                Internal comment
              </span>

            </label>

            <button
              type="submit"
              disabled={submitting}
              className="add-comment-btn"
            >
              {submitting
                ? "Adding..."
                : "Add Comment"}
            </button>

          </div>

        </form>

        {/* COMMENTS LIST */}
        <div className="comments-list">

          <div className="comments-list-header">
            <h3>
              Comments ({comments.length})
            </h3>
          </div>

          {loading ? (

            <div className="comments-loading">
              Loading comments...
            </div>

          ) : comments.length === 0 ? (

            <div className="comments-empty">
              <div className="comments-empty-icon">
                💬
              </div>

              <h3>No comments yet</h3>

              <p>
                Start the discussion by adding
                the first comment.
              </p>
            </div>

          ) : (

            comments.map((comment) => (

              <div
                key={comment.id}
                className="comment-item"
              >

                <div className="comment-top">

                  <div className="comment-user">
                    👤 User #{comment.user_id}
                  </div>

                  {comment.is_internal && (
                    <span className="internal-badge">
                      🔒 Internal
                    </span>
                  )}

                </div>

                <p className="comment-content">
                  {comment.content}
                </p>

                <div className="comment-date">
                  {comment.created_at
                    ? new Date(
                        comment.created_at
                      ).toLocaleString()
                    : "Unknown time"}
                </div>

              </div>

            ))

          )}

        </div>

      </div>

      <style>{`

        .comments-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          z-index: 1000;
        }

        .comments-modal {
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 16px;
          box-shadow:
            0 20px 60px
            rgba(0, 0, 0, 0.2);
        }

        .comments-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 25px;
          border-bottom: 1px solid #e5e7eb;
        }

        .comments-eyebrow {
          margin: 0 0 5px;
          color: #2563eb;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .comments-header h2 {
          margin: 0;
          color: #111827;
          font-size: 24px;
        }

        .comments-header p {
          margin: 6px 0 0;
          color: #6b7280;
          font-size: 13px;
        }

        .comments-close-btn {
          border: none;
          background: #f1f5f9;
          color: #475569;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
        }

        .comments-close-btn:hover {
          background: #e2e8f0;
        }

        .comments-error {
          margin: 20px 25px 0;
          padding: 12px 15px;
          border-radius: 8px;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
          font-size: 13px;
        }

        .comment-form {
          margin: 20px 25px;
          padding: 18px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }

        .comment-form textarea {
          width: 100%;
          resize: vertical;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 12px;
          font-family: inherit;
          font-size: 14px;
          outline: none;
        }

        .comment-form textarea:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px
            rgba(37, 99, 235, 0.1);
        }

        .comment-form-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          gap: 15px;
        }

        .internal-option {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #475569;
          font-size: 13px;
          cursor: pointer;
        }

        .internal-option input {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .add-comment-btn {
          border: none;
          background: #2563eb;
          color: white;
          padding: 10px 17px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .add-comment-btn:hover {
          background: #1d4ed8;
        }

        .add-comment-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .comments-list {
          padding: 0 25px 25px;
        }

        .comments-list-header {
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 5px;
        }

        .comments-list-header h3 {
          margin: 0;
          padding: 10px 0;
          font-size: 15px;
          color: #334155;
        }

        .comment-item {
          padding: 17px 5px;
          border-bottom: 1px solid #f1f5f9;
        }

        .comment-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .comment-user {
          color: #334155;
          font-size: 13px;
          font-weight: 700;
        }

        .internal-badge {
          background: #fef3c7;
          color: #92400e;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
        }

        .comment-content {
          margin: 10px 0;
          color: #374151;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .comment-date {
          color: #94a3b8;
          font-size: 11px;
        }

        .comments-loading {
          padding: 35px;
          text-align: center;
          color: #64748b;
        }

        .comments-empty {
          text-align: center;
          padding: 40px 20px;
        }

        .comments-empty-icon {
          font-size: 40px;
          margin-bottom: 10px;
        }

        .comments-empty h3 {
          margin: 0;
          color: #334155;
        }

        .comments-empty p {
          color: #64748b;
          font-size: 13px;
        }

        @media (max-width: 600px) {

          .comments-overlay {
            padding: 10px;
          }

          .comments-modal {
            max-height: 95vh;
          }

          .comments-header {
            padding: 20px;
          }

          .comment-form {
            margin: 15px 20px;
          }

          .comments-list {
            padding: 0 20px 20px;
          }

          .comment-form-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .add-comment-btn {
            width: 100%;
          }
        }

      `}</style>

    </div>
  );
}

export default Comments;
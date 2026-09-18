import { useEffect, useState } from "react";
import {
  DndContext,
  closestCorners,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

const API_URL = "http://127.0.0.1:8000/api/v1";

const COLUMNS = [
  {
    id: "todo",
    title: "TODO",
  },
  {
    id: "in_progress",
    title: "IN PROGRESS",
  },
  {
    id: "review",
    title: "REVIEW",
  },
  {
    id: "done",
    title: "DONE",
  },
];

function TaskCard({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `task-${task.id}`,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        padding: "15px",
        marginBottom: "12px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      }}
      {...listeners}
      {...attributes}
    >
      <h3
        style={{
          margin: "0 0 8px",
          fontSize: "16px",
          fontWeight: "600",
        }}
      >
        {task.title}
      </h3>

      {task.description && (
        <p
          style={{
            margin: "0 0 10px",
            color: "#6b7280",
            fontSize: "13px",
          }}
        >
          {task.description}
        </p>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "12px",
        }}
      >
        <span
          style={{
            padding: "4px 8px",
            borderRadius: "6px",
            background:
              task.priority === "high"
                ? "#fee2e2"
                : task.priority === "medium"
                ? "#fef3c7"
                : "#dcfce7",
            color:
              task.priority === "high"
                ? "#b91c1c"
                : task.priority === "medium"
                ? "#92400e"
                : "#166534",
          }}
        >
          {task.priority}
        </span>

        {task.due_date && (
          <span style={{ color: "#6b7280" }}>
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({ column, tasks }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        minWidth: "260px",
        background: isOver ? "#eef2ff" : "#f3f4f6",
        borderRadius: "12px",
        padding: "15px",
        minHeight: "450px",
        transition: "background 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "15px",
            fontWeight: "700",
          }}
        >
          {column.title}
        </h2>

        <span
          style={{
            background: "#e5e7eb",
            borderRadius: "20px",
            padding: "4px 9px",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          {tasks.length}
        </span>
      </div>

      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
        />
      ))}
    </div>
  );
}

function KanbanBoard() {
  const [tasks, setTasks] = useState({
    todo: [],
    in_progress: [],
    review: [],
    done: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  const fetchKanban = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/tasks/kanban`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load Kanban board");
      }

      const data = await response.json();

      setTasks({
        todo: data.todo || [],
        in_progress: data.in_progress || [],
        review: data.review || [],
        done: data.done || [],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKanban();
  }, []);

  const findTaskStatus = (taskId) => {
    for (const column of COLUMNS) {
      const exists = tasks[column.id].some(
        (task) => task.id === taskId
      );

      if (exists) {
        return column.id;
      }
    }

    return null;
  };

  const moveTaskLocally = (
    taskId,
    oldStatus,
    newStatus
  ) => {
    const task = tasks[oldStatus].find(
      (item) => item.id === taskId
    );

    if (!task) {
      return;
    }

    const updatedTask = {
      ...task,
      status: newStatus,
    };

    setTasks((previous) => ({
      ...previous,
      [oldStatus]: previous[oldStatus].filter(
        (item) => item.id !== taskId
      ),
      [newStatus]: [
        ...previous[newStatus],
        updatedTask,
      ],
    }));
  };

  const updateTaskStatus = async (
    taskId,
    newStatus
  ) => {
    const response = await fetch(
      `${API_URL}/tasks/${taskId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      throw new Error(
        data?.detail || "Status update failed"
      );
    }

    return response.json();
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const taskId = Number(
      String(active.id).replace("task-", "")
    );

    const overId = String(over.id);

    if (!overId.startsWith("column-")) {
      return;
    }

    const newStatus = overId.replace(
      "column-",
      ""
    );

    const oldStatus = findTaskStatus(taskId);

    if (!oldStatus || oldStatus === newStatus) {
      return;
    }

    try {
      setError("");

      await updateTaskStatus(
        taskId,
        newStatus
      );

      moveTaskLocally(
        taskId,
        oldStatus,
        newStatus
      );
    } catch (err) {
      setError(err.message);
      await fetchKanban();
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "30px",
          textAlign: "center",
        }}
      >
        Loading Kanban board...
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div
          style={{
            marginBottom: "15px",
            padding: "12px",
            background: "#fee2e2",
            color: "#b91c1c",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div
          style={{
            display: "flex",
            gap: "20px",
            overflowX: "auto",
            paddingBottom: "20px",
          }}
        >
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasks[column.id]}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

export default KanbanBoard;
import { useEffect, useState } from 'react';
import api from "./api/axios";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Fetch all tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new task
  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!newTaskTitle.trim()) {
      setError('Task title cannot be empty');
      return;
    }

    try {
      setError(null);
      const response = await api.post('/tasks', {
        title: newTaskTitle.trim(),
        isDone: false
      });

      setTasks([...tasks, response.data]);
      setNewTaskTitle('');
      showSuccessMessage('Task created successfully!');
    } catch (err) {
      console.log('=== FULL ERROR DETAILS ===');
      console.log('Response Data:', err.response?.data);
      console.log('Response Status:', err.response?.status);
      console.log('Errors Object:', err.response?.data?.errors);
      console.log('========================');
      setError(err.response?.data?.title || 'Failed to create task. Please try again.');
      console.error('Error creating task:', err);
    }
  };

  // Toggle task completion status
  const handleToggleTask = async (task) => {
    try {
      setError(null);
      const response = await api.put(`/tasks/${task.id}`, {
        title: task.title,
        isDone: !task.isDone
      });

      setTasks(tasks.map(t => t.id === task.id ? response.data : t));
      showSuccessMessage(`Task marked as ${!task.isDone ? 'done' : 'undone'}!`);
    } catch (err) {
      setError('Failed to update task. Please try again.');
      console.error('Error toggling task:', err);
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      setError(null);
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
      showSuccessMessage('Task deleted successfully!');
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      console.error('Error deleting task:', err);
    }
  };

  // Show success message temporarily
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Start editing a task
  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditedTitle(task.title);
    setError(null);
  };

  // Save edited task
  const handleSaveEdit = async (task) => {
    if (!editedTitle.trim()) {
      setError('Task title cannot be empty');
      return;
    }

    try {
      setError(null);
      const response = await api.put(`/tasks/${task.id}`, {
        title: editedTitle.trim(),
        isDone: task.isDone
      });

      setTasks(tasks.map(t => t.id === task.id ? response.data : t));
      setEditingTaskId(null);
      setEditedTitle('');
      showSuccessMessage('Task updated successfully!');
    } catch (err) {
      setError('Failed to update task. Please try again.');
      console.error('Error updating task:', err);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditedTitle('');
    setError(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="tasks-container">
        <h2>Tasks</h2>
        <div className="loading">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="tasks-container">
      <h2>Task Manager</h2>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
          <button onClick={() => setError(null)} className="close-btn">✕</button>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          ✅ {successMessage}
        </div>
      )}

      {/* Create Task Form */}
      <form onSubmit={handleCreateTask} className="task-form">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Enter a new task..."
          className="task-input"
          maxLength="200"
        />
        <button type="submit" className="btn-primary">
          Add Task
        </button>
      </form>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="empty-state">
          <p>📝 No tasks yet. Create your first task above!</p>
        </div>
      ) : (
        <ul className="task-list">
          {tasks.map(task => (
            <li key={task.id} className={`task-item ${task.isDone ? 'completed' : ''}`}>
              <div className="task-content">
                <span
                  className="task-status"
                  onClick={() => handleToggleTask(task)}
                  title="Click to toggle completion"
                >
                  {task.isDone ? '✅' : '⬜'}
                </span>

                {editingTaskId === task.id ? (
                  // Edit mode: show input field
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="task-edit-input"
                    maxLength="200"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(task);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                ) : (
                  // View mode: show task title
                  <span className="task-title">
                    {task.title}
                  </span>
                )}
              </div>

              <div className="task-actions">
                {editingTaskId === task.id ? (
                  // Edit mode: show save and cancel buttons
                  <>
                    <button
                      onClick={() => handleSaveEdit(task)}
                      className="btn-save"
                      title="Save changes"
                    >
                      ✓
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="btn-cancel"
                      title="Cancel editing"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  // View mode: show edit and delete buttons
                  <>
                    <button
                      onClick={() => handleEditTask(task)}
                      className="btn-edit"
                      title="Edit task"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="btn-delete"
                      title="Delete task"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Task Count */}
      {tasks.length > 0 && (
        <div className="task-count">
          Total: {tasks.length} | Completed: {tasks.filter(t => t.isDone).length}
        </div>
      )}
    </div>
  );
}

export default Tasks;

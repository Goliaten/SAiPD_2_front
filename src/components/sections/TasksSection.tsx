import React, { useEffect, useState } from 'react';
import { taskAPI, exerciseHistoryAPI, userAPI } from '../../api';
import { useAuthStore } from '../../store';

type Task = {
  id: number;
  exercise_history_id: number;
  user_id: number;
  task_type: string;
  title: string;
  content: string;
  status: string;
  created_date: string;
  modified_date: string;
};

type ExerciseHistory = {
  id: number;
  class_exercise_id: number;
  datetime_of_class: string;
  status: string;
};

type User = {
  id: number;
  first_name: string;
  last_name: string;
  login: string;
};

const TASK_STATUSES = ['pending', 'in_progress', 'completed', 'to_redo', 'failed'];
const TASK_TYPES = ['assignment', 'homework', 'quiz'];

export function TasksSection() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [exerciseHistories, setExerciseHistories] = useState<ExerciseHistory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(20);
  const [filters, setFilters] = useState({
    user_id: '',
    exercise_history_id: '',
    status: '',
  });

  const currentUser = useAuthStore((s) => s.user);

  const [formData, setFormData] = useState({
    exercise_history_id: '',
    user_id: '',
    task_type: 'assignment',
    title: '',
    content: '',
    status: 'pending',
  });

  useEffect(() => {
    fetchTasks();
    fetchExerciseHistories();
    fetchUsers();
  }, [skip, limit, filters]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const filterParams: any = { skip, limit };
      if (filters.user_id) filterParams.user_id = parseInt(filters.user_id);
      if (filters.exercise_history_id) 
        filterParams.exercise_history_id = parseInt(filters.exercise_history_id);
      if (filters.status) filterParams.status = filters.status;

      const response = await taskAPI.list(skip, limit, filterParams);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExerciseHistories = async () => {
    try {
      const response = await exerciseHistoryAPI.list(0, 1000);
      setExerciseHistories(response.data);
    } catch (error) {
      console.error('Error fetching exercise histories:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.list(0, 1000);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setSkip(0);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataToSend = {
        exercise_history_id: parseInt(formData.exercise_history_id),
        user_id: parseInt(formData.user_id),
        task_type: formData.task_type,
        title: formData.title,
        content: formData.content,
        status: formData.status,
      };

      await taskAPI.create(dataToSend);
      setShowForm(false);
      setFormData({
        exercise_history_id: '',
        user_id: '',
        task_type: 'assignment',
        title: '',
        content: '',
        status: 'pending',
      });
      setSkip(0);
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task');
    }
  };

  const handleStatusUpdate = async (taskId: number, newStatus: string) => {
    try {
      await taskAPI.updateStatus(taskId, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Error updating task status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskAPI.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task');
    }
  };

  const getUserName = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : `User ${userId}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'to_redo':
        return 'bg-orange-100 text-orange-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Task Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {showForm ? 'Cancel' : 'Create Task'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Create New Task</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exercise Session
                </label>
                <select
                  name="exercise_history_id"
                  value={formData.exercise_history_id}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select exercise session...</option>
                  {exerciseHistories.map((eh) => (
                    <option key={eh.id} value={eh.id}>
                      Session {eh.id} - {formatDate(eh.datetime_of_class)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student
                </label>
                <select
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select student...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.login})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Type
                </label>
                <select
                  name="task_type"
                  value={formData.task_type}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  {TASK_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  {TASK_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, ' ').charAt(0).toUpperCase() + 
                       status.replace(/_/g, ' ').slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Task title"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Task description/instructions"
                  required
                  rows={2}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Create Task
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student
            </label>
            <select
              name="user_id"
              value={filters.user_id}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="">All students</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exercise Session
            </label>
            <select
              name="exercise_history_id"
              value={filters.exercise_history_id}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="">All sessions</option>
              {exerciseHistories.map((eh) => (
                <option key={eh.id} value={eh.id}>
                  Session {eh.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="">All statuses</option>
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ').charAt(0).toUpperCase() + 
                   status.replace(/_/g, ' ').slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <p className="text-gray-500">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500">No tasks found</p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="border border-gray-200 rounded p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-lg">{task.title}</p>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                        {task.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {task.task_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Assigned to: <strong>{getUserName(task.user_id)}</strong>
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(task.created_date)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>

                <p className="text-gray-700 mb-3">{task.content}</p>

                <div className="flex flex-wrap gap-2">
                  <label className="text-sm font-medium text-gray-700">Update status:</label>
                  {TASK_STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(task.id, status)}
                      disabled={task.status === status}
                      className={`text-xs px-3 py-1 rounded font-medium transition ${
                        task.status === status
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {status.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => setSkip(Math.max(0, skip - limit))}
            disabled={skip === 0}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {Math.floor(skip / limit) + 1}
          </span>
          <button
            onClick={() => setSkip(skip + limit)}
            disabled={tasks.length < limit}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

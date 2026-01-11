import React, { useEffect, useState } from 'react';
import { attendanceAPI, exerciseHistoryAPI, userAPI } from '../../api';

type Attendance = {
  id: number;
  user_id: number;
  exercise_history_id: number;
  status: string;
  marked_at: string;
  created_date: string;
  modified_date: string;
};

type User = {
  id: number;
  login: string;
  first_name: string;
  last_name: string;
};

type ExerciseHistory = {
  id: number;
  class_exercise_id: number;
  datetime_of_class: string;
  teacher_id: number;
  status: string;
};

export function AttendanceSection() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [exerciseHistories, setExerciseHistories] = useState<ExerciseHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(20);

  const [filters, setFilters] = useState({
    user_id: '',
    class_id: '',
    exercise_history_id: '',
    status: '',
  });

  const [showMarkModal, setShowMarkModal] = useState(false);
  const [markForm, setMarkForm] = useState({ exercise_history_id: '', user_id: '', status: 'present' });
  const [markingId, setMarkingId] = useState<number | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ status: 'present' });
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchAttendances();
    fetchUsers();
    fetchExerciseHistories();
  }, [skip, limit, filters]);

  const fetchAttendances = async () => {
    setLoading(true);
    try {
      const filterParams: any = { skip, limit };
      if (filters.user_id) filterParams.user_id = parseInt(filters.user_id);
      if (filters.exercise_history_id) filterParams.exercise_history_id = parseInt(filters.exercise_history_id);
      if (filters.status) filterParams.status = filters.status;

      const res = await attendanceAPI.list(skip, limit, filterParams);
      setAttendances(res.data || []);
    } catch (err) {
      console.error('Error fetching attendances', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await userAPI.list(0, 1000);
      setUsers(res.data || []);
    } catch (err) {
      console.error('Error fetching users', err);
    }
  };

  const fetchExerciseHistories = async () => {
    try {
      const res = await exerciseHistoryAPI.list(0, 1000);
      setExerciseHistories(res.data || []);
    } catch (err) {
      console.error('Error fetching exercise histories', err);
    }
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!markForm.exercise_history_id || !markForm.user_id) {
      alert('Please select both exercise history and user');
      return;
    }

    setMarkingId(parseInt(markForm.exercise_history_id));
    try {
      const payload = {
        user_id: parseInt(markForm.user_id),
        status: markForm.status,
      };
      await attendanceAPI.mark(parseInt(markForm.exercise_history_id), payload);
      await fetchAttendances();
      setShowMarkModal(false);
      setMarkForm({ exercise_history_id: '', user_id: '', status: 'present' });
      alert('Attendance marked successfully!');
    } catch (err: any) {
      console.error('Error marking attendance', err);
      alert(err.response?.data?.detail || 'Failed to mark attendance');
    } finally {
      setMarkingId(null);
    }
  };

  const openEditModal = (attendance: Attendance) => {
    setEditingId(attendance.id);
    setEditForm({ status: attendance.status });
    setShowEditModal(true);
  };

  const handleUpdateAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      await attendanceAPI.update(editingId, { status: editForm.status });
      await fetchAttendances();
      setShowEditModal(false);
      alert('Attendance updated successfully!');
    } catch (err: any) {
      console.error('Error updating attendance', err);
      alert(err.response?.data?.detail || 'Failed to update attendance');
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setSkip(0);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'excused':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserName = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : `User ${userId}`;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Attendance</h2>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Mark Attendance</h3>
          <button
            onClick={() => setShowMarkModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Mark Attendance
          </button>
        </div>
        <p className="text-gray-600 text-sm">
          Select an exercise session and user to mark attendance.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">User</label>
            <select
              value={filters.user_id}
              onChange={(e) => handleFilterChange('user_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Users</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.first_name} {u.last_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Exercise History ID</label>
            <input
              type="number"
              value={filters.exercise_history_id}
              onChange={(e) => handleFilterChange('exercise_history_id', e.target.value)}
              placeholder="Filter by exercise history ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendances Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">User</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Exercise History ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Marked At</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : attendances.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No attendance records found
                </td>
              </tr>
            ) : (
              attendances.map((attendance) => (
                <tr key={attendance.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{attendance.id}</td>
                  <td className="px-6 py-4 text-sm">{getUserName(attendance.user_id)}</td>
                  <td className="px-6 py-4 text-sm">{attendance.exercise_history_id}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(attendance.status)}`}>
                      {attendance.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{formatDateTime(attendance.marked_at)}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => openEditModal(attendance)}
                      className="text-blue-500 hover:text-blue-700 font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {skip + 1} to {skip + limit} of results
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSkip(Math.max(0, skip - limit))}
            disabled={skip === 0}
            className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setSkip(skip + limit)}
            disabled={attendances.length < limit}
            className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {showMarkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Mark Attendance</h3>
            <form onSubmit={handleMarkAttendance}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Exercise Session</label>
                <select
                  value={markForm.exercise_history_id}
                  onChange={(e) => setMarkForm((prev) => ({ ...prev, exercise_history_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose an exercise session...</option>
                  {exerciseHistories.map((eh) => (
                    <option key={eh.id} value={eh.id}>
                      Exercise {eh.class_exercise_id} - {formatDateTime(eh.datetime_of_class)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">User</label>
                <select
                  value={markForm.user_id}
                  onChange={(e) => setMarkForm((prev) => ({ ...prev, user_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a user...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={markForm.status}
                  onChange={(e) => setMarkForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowMarkModal(false)}
                  className="flex-1 px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={markingId !== null}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {markingId !== null ? 'Marking...' : 'Mark Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Update Attendance</h3>
            <form onSubmit={handleUpdateAttendance}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

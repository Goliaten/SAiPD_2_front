import React, { useEffect, useState } from 'react';
import { attendanceAPI, exerciseHistoryAPI, userAPI, exerciseAPI } from '../../api';

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
  const [exercises, setExercises] = useState<any[]>([]);
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

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({ exercise_history_id: '', force: false });
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [generatedCount, setGeneratedCount] = useState<number | null>(null);

  useEffect(() => {
    fetchAttendances();
    fetchUsers();
    fetchExerciseHistories();
    fetchExercises();
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

  const fetchExercises = async () => {
    try {
      const res = await exerciseAPI.list(0, 1000);
      setExercises(res.data || []);
    } catch (err) {
      console.error('Error fetching exercises', err);
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
      // Use convenience endpoints for simple status updates when available
      if (['present', 'absent', 'late'].includes(markForm.status)) {
        await attendanceAPI.setStatusForUser(
          parseInt(markForm.exercise_history_id),
          parseInt(markForm.user_id),
          markForm.status,
          false
        );
      } else {
        // Fallback: use mark endpoint if available or update by searching existing row
        await attendanceAPI.mark(parseInt(markForm.exercise_history_id), payload);
      }
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

  const updateRowStatus = async (attendance: Attendance, status: string) => {
    const key = `${attendance.exercise_history_id}-${attendance.user_id}`;
    setUpdatingId(key);
    try {
      if (status === 'present' || status === 'absent' || status === 'late') {
        await attendanceAPI.setStatusForUser(attendance.exercise_history_id, attendance.user_id, status, false);
      } else {
        // Fallback for statuses not covered by convenience endpoints (e.g. 'excused')
        await attendanceAPI.update(attendance.id, { status });
      }

      await fetchAttendances();
    } catch (err: any) {
      console.error('Error updating attendance', err);
      alert(err.response?.data?.detail || err.message || 'Failed to update attendance');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleGenerateAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateForm.exercise_history_id) {
      alert('Please select an exercise session');
      return;
    }

    setGeneratingId(parseInt(generateForm.exercise_history_id));
    try {
      const res = await attendanceAPI.generate(
        parseInt(generateForm.exercise_history_id),
        generateForm.force
      );
      const count = res.data || 0;
      setGeneratedCount(count);
      await fetchAttendances();
      setShowGenerateModal(false);
      alert(`Attendance records generated! ${count} record(s) created/updated.`);
      setGenerateForm({ exercise_history_id: '', force: false });
    } catch (err: any) {
      console.error('Error generating attendance', err);
      alert(err.response?.data?.detail || 'Failed to generate attendance records');
    } finally {
      setGeneratingId(null);
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

  const getExerciseInfo = (exerciseHistoryId: number) => {
    const eh = exerciseHistories.find((e) => e.id === exerciseHistoryId);
    if (!eh) return { name: 'Unknown', datetime: 'Unknown' };
    const exercise = exercises.find((e) => e.id === eh.class_exercise_id);
    const exerciseName = exercise ? exercise.name : `Exercise ${eh.class_exercise_id}`;
    return {
      name: exerciseName,
      datetime: formatDateTime(eh.datetime_of_class),
    };
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Attendance</h2>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Mark Attendance</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Generate Attendance
            </button>
            <button
              onClick={() => setShowMarkModal(true)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Mark Attendance
            </button>
          </div>
        </div>
        <p className="text-gray-600 text-sm">
          Generate attendance records for exercise sessions or mark individual attendance.
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
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Exercise</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">DateTime</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Marked At</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : attendances.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No attendance records found
                </td>
              </tr>
            ) : (
              attendances.map((attendance) => {
                const exerciseInfo = getExerciseInfo(attendance.exercise_history_id);
                return (
                <tr key={attendance.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{attendance.id}</td>
                  <td className="px-6 py-4 text-sm">{getUserName(attendance.user_id)}</td>
                  <td className="px-6 py-4 text-sm">{exerciseInfo.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-xs">{exerciseInfo.datetime}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(attendance.status)}`}>
                      {attendance.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{formatDateTime(attendance.marked_at)}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateRowStatus(attendance, 'present')}
                        disabled={updatingId === `${attendance.exercise_history_id}-${attendance.user_id}`}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm disabled:opacity-50"
                      >
                        Present
                      </button>
                      <button
                        onClick={() => updateRowStatus(attendance, 'absent')}
                        disabled={updatingId === `${attendance.exercise_history_id}-${attendance.user_id}`}
                        className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm disabled:opacity-50"
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => updateRowStatus(attendance, 'late')}
                        disabled={updatingId === `${attendance.exercise_history_id}-${attendance.user_id}`}
                        className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm disabled:opacity-50"
                      >
                        Late
                      </button>
                      {/* <button
                        onClick={() => updateRowStatus(attendance, 'excused')}
                        disabled={updatingId === `${attendance.exercise_history_id}-${attendance.user_id}`}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm disabled:opacity-50"
                      >
                        Excused
                      </button> */}
                    </div>
                  </td>
                </tr>
              );
              })
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

      {/* Generate Attendance Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Generate Attendance Records</h3>
            <form onSubmit={handleGenerateAttendance}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Exercise Session *</label>
                <select
                  value={generateForm.exercise_history_id}
                  onChange={(e) => setGenerateForm((prev) => ({ ...prev, exercise_history_id: e.target.value }))}
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
                <label className="flex items-center text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={generateForm.force}
                    onChange={(e) => setGenerateForm((prev) => ({ ...prev, force: e.target.checked }))}
                    className="w-4 h-4 mr-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  Force regenerate (overwrite existing records)
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  If unchecked, only creates records for students without existing attendance.
                </p>
              </div>
              {generatedCount !== null && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm font-medium text-green-800">
                    ✓ {generatedCount} attendance record(s) generated
                  </p>
                </div>
              )}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowGenerateModal(false);
                    setGeneratedCount(null);
                  }}
                  className="flex-1 px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={generatingId !== null}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingId !== null ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      
    </div>
  );
}

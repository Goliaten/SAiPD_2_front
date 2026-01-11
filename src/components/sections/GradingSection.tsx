import React, { useEffect, useState } from 'react';
import { gradeAPI, userAPI, exerciseHistoryAPI, classAPI, exerciseAPI } from '../../api';

type Grade = {
  id: number;
  user_id: number;
  exercise_history_id: number;
  grade: number;
  feedback: string;
  graded_by: number;
  graded_at: string;
  created_date: string;
  modified_date: string;
};

type User = {
  id: number;
  login: string;
  first_name: string;
  last_name: string;
};

type Exercise = {
  id: number;
  name: string;
};

type Class = {
  id: number;
  name: string;
};

type Statistics = {
  avg?: number;
  min?: number;
  max?: number;
};

export function GradingSection() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(20);

  const [filters, setFilters] = useState({
    user_id: '',
    exercise_id: '',
    class_id: '',
    teacher_id: '',
  });

  const [statistics, setStatistics] = useState<Statistics>({});
  const [showStatistics, setShowStatistics] = useState(false);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ exercise_history_id: '', user_id: '', grade: '', feedback: '' });
  const [assigningId, setAssigningId] = useState<number | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ grade: '', feedback: '' });
  const [showEditModal, setShowEditModal] = useState(false);

  const [exerciseHistories, setExerciseHistories] = useState<any[]>([]);

  useEffect(() => {
    fetchGrades();
    fetchUsers();
    fetchExercises();
    fetchClasses();
    fetchExerciseHistories();
  }, [skip, limit, filters]);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const filterParams: any = { skip, limit };
      if (filters.user_id) filterParams.user_id = parseInt(filters.user_id);
      if (filters.exercise_id) filterParams.exercise_id = parseInt(filters.exercise_id);
      if (filters.class_id) filterParams.class_id = parseInt(filters.class_id);
      if (filters.teacher_id) filterParams.teacher_id = parseInt(filters.teacher_id);

      const res = await gradeAPI.list(skip, limit, filterParams);
      setGrades(res.data || []);
    } catch (err) {
      console.error('Error fetching grades', err);
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

  const fetchExercises = async () => {
    try {
      const res = await exerciseAPI.list(0, 1000);
      setExercises(res.data || []);
    } catch (err) {
      console.error('Error fetching exercises', err);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await classAPI.list(0, 1000);
      setClasses(res.data || []);
    } catch (err) {
      console.error('Error fetching classes', err);
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

  const fetchStatistics = async () => {
    try {
      const filterParams: any = {};
      if (filters.user_id) filterParams.user_id = parseInt(filters.user_id);
      if (filters.exercise_id) filterParams.exercise_id = parseInt(filters.exercise_id);
      if (filters.class_id) filterParams.class_id = parseInt(filters.class_id);
      if (filters.teacher_id) filterParams.teacher_id = parseInt(filters.teacher_id);

      const res = await gradeAPI.statistics(filterParams);
      setStatistics(res.data || {});
      setShowStatistics(true);
    } catch (err) {
      console.error('Error fetching statistics', err);
      alert('Failed to load statistics');
    }
  };

  const handleAssignGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.exercise_history_id || !assignForm.user_id || !assignForm.grade) {
      alert('Please fill in all required fields');
      return;
    }

    setAssigningId(parseInt(assignForm.exercise_history_id));
    try {
      const payload = {
        user_id: parseInt(assignForm.user_id),
        grade: parseFloat(assignForm.grade),
        feedback: assignForm.feedback,
      };
      await gradeAPI.assign(parseInt(assignForm.exercise_history_id), payload);
      await fetchGrades();
      setShowAssignModal(false);
      setAssignForm({ exercise_history_id: '', user_id: '', grade: '', feedback: '' });
      alert('Grade assigned successfully!');
    } catch (err: any) {
      console.error('Error assigning grade', err);
      alert(err.response?.data?.detail || 'Failed to assign grade');
    } finally {
      setAssigningId(null);
    }
  };

  const openEditModal = (grade: Grade) => {
    setEditingId(grade.id);
    setEditForm({ grade: grade.grade.toString(), feedback: grade.feedback });
    setShowEditModal(true);
  };

  const handleUpdateGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      const payload = {
        grade: parseFloat(editForm.grade),
        feedback: editForm.feedback,
      };
      await gradeAPI.update(editingId, payload);
      await fetchGrades();
      setShowEditModal(false);
      alert('Grade updated successfully!');
    } catch (err: any) {
      console.error('Error updating grade', err);
      alert(err.response?.data?.detail || 'Failed to update grade');
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setSkip(0);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'bg-green-100 text-green-800';
    if (grade >= 80) return 'bg-blue-100 text-blue-800';
    if (grade >= 70) return 'bg-yellow-100 text-yellow-800';
    if (grade >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getUserName = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : `User ${userId}`;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Grading</h2>

      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm mb-1">Average Grade</p>
          <p className="text-3xl font-bold text-blue-600">{(statistics.avg || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm mb-1">Highest Grade</p>
          <p className="text-3xl font-bold text-green-600">{(statistics.max || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm mb-1">Lowest Grade</p>
          <p className="text-3xl font-bold text-red-600">{(statistics.min || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-center">
          <button
            onClick={fetchStatistics}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh Stats
          </button>
        </div>
      </div> */}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Assign Grade</h3>
          <button
            onClick={() => setShowAssignModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Assign Grade
          </button>
        </div>
        <p className="text-gray-600 text-sm">
          Select an exercise session and user to assign a grade.
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
            <label className="block text-sm font-medium mb-2">Exercise</label>
            <select
              value={filters.exercise_id}
              onChange={(e) => handleFilterChange('exercise_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Exercises</option>
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Class</label>
            <select
              value={filters.class_id}
              onChange={(e) => handleFilterChange('class_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Teacher ID</label>
            <input
              type="number"
              value={filters.teacher_id}
              onChange={(e) => handleFilterChange('teacher_id', e.target.value)}
              placeholder="Filter by teacher ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">User</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Exercise History ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Grade</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Feedback</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Graded By</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Graded At</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : grades.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No grades found
                </td>
              </tr>
            ) : (
              grades.map((grade) => (
                <tr key={grade.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{grade.id}</td>
                  <td className="px-6 py-4 text-sm">{getUserName(grade.user_id)}</td>
                  <td className="px-6 py-4 text-sm">{grade.exercise_history_id}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGradeColor(grade.grade)}`}>
                      {grade.grade.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{grade.feedback || '-'}</td>
                  <td className="px-6 py-4 text-sm">{grade.graded_by}</td>
                  <td className="px-6 py-4 text-sm">{formatDateTime(grade.graded_at)}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => openEditModal(grade)}
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
            disabled={grades.length < limit}
            className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Assign Grade Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Assign Grade</h3>
            <form onSubmit={handleAssignGrade}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Exercise Session</label>
                <select
                  value={assignForm.exercise_history_id}
                  onChange={(e) => setAssignForm((prev) => ({ ...prev, exercise_history_id: e.target.value }))}
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
                  value={assignForm.user_id}
                  onChange={(e) => setAssignForm((prev) => ({ ...prev, user_id: e.target.value }))}
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
                <label className="block text-sm font-medium mb-2">Grade *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={assignForm.grade}
                  onChange={(e) => setAssignForm((prev) => ({ ...prev, grade: e.target.value }))}
                  placeholder="Enter grade (0-100)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Feedback</label>
                <textarea
                  value={assignForm.feedback}
                  onChange={(e) => setAssignForm((prev) => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Add feedback..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigningId !== null}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assigningId !== null ? 'Assigning...' : 'Assign Grade'}
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
            <h3 className="text-xl font-bold mb-4">Update Grade</h3>
            <form onSubmit={handleUpdateGrade}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Grade</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={editForm.grade}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, grade: e.target.value }))}
                  placeholder="Enter grade (0-100)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Feedback</label>
                <textarea
                  value={editForm.feedback}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Add feedback..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
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

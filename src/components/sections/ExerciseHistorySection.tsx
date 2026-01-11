import React, { useEffect, useState } from 'react';
import { exerciseHistoryAPI, classAPI } from '../../api';

type ExerciseHistory = {
  id: number;
  class_exercise_id: number;
  datetime_of_class: string;
  teacher_id: number;
  status: string;
  created_date: string;
  modified_date: string;
};

type Class = {
  id: number;
  name: string;
};

export function ExerciseHistorySection() {
  const [histories, setHistories] = useState<ExerciseHistory[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(20);

  const [filters, setFilters] = useState({
    class_exercise_id: '',
    teacher_id: '',
    status: '',
  });

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ status: '', notes: '' });
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchHistories();
    fetchClasses();
  }, [skip, limit, filters]);

  const fetchHistories = async () => {
    setLoading(true);
    try {
      const filterParams: any = { skip, limit };
      if (filters.class_exercise_id) filterParams.class_exercise_id = parseInt(filters.class_exercise_id);
      if (filters.teacher_id) filterParams.teacher_id = parseInt(filters.teacher_id);
      if (filters.status) filterParams.status = filters.status;

      const res = await exerciseHistoryAPI.list(skip, limit, filterParams);
      setHistories(res.data || []);
    } catch (err) {
      console.error('Error fetching exercise histories', err);
      alert('Failed to load exercise histories');
    } finally {
      setLoading(false);
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

  const handleGenerateHistory = async (classId: number) => {
    setGeneratingId(classId);
    try {
      await exerciseHistoryAPI.generate(classId);
      await fetchHistories();
      setShowGenerateModal(false);
      alert('Exercise history generated successfully!');
    } catch (err: any) {
      console.error('Error generating exercise history', err);
      alert(err.response?.data?.detail || 'Failed to generate exercise history');
    } finally {
      setGeneratingId(null);
    }
  };

  const openEditModal = async (history: ExerciseHistory) => {
    setEditingId(history.id);
    setEditForm({ status: history.status, notes: '' });
    setShowEditModal(true);
  };

  const handleUpdateHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      const payload = {
        status: editForm.status,
        notes: editForm.notes,
      };
      await exerciseHistoryAPI.update(editingId, payload);
      await fetchHistories();
      setShowEditModal(false);
      alert('Exercise history updated successfully!');
    } catch (err: any) {
      console.error('Error updating exercise history', err);
      alert(err.response?.data?.detail || 'Failed to update exercise history');
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
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'not_started':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Exercise History</h2>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Generate History</h3>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Generate for Class
          </button>
        </div>
        <p className="text-gray-600 text-sm">
          Select a class to generate exercise history records based on scheduling rules.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Class Exercise ID</label>
            <input
              type="number"
              value={filters.class_exercise_id}
              onChange={(e) => handleFilterChange('class_exercise_id', e.target.value)}
              placeholder="Filter by class exercise ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Histories Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Class Exercise ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">DateTime</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Teacher ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
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
            ) : histories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No exercise histories found
                </td>
              </tr>
            ) : (
              histories.map((history) => (
                <tr key={history.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{history.id}</td>
                  <td className="px-6 py-4 text-sm">{history.class_exercise_id}</td>
                  <td className="px-6 py-4 text-sm">{formatDateTime(history.datetime_of_class)}</td>
                  <td className="px-6 py-4 text-sm">{history.teacher_id}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(history.status)}`}>
                      {history.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => openEditModal(history)}
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
            disabled={histories.length < limit}
            className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Generate Exercise History</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Class</label>
              <select
                value={selectedClassId || ''}
                onChange={(e) => setSelectedClassId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a class...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedClassId && handleGenerateHistory(selectedClassId)}
                disabled={!selectedClassId || generatingId === selectedClassId}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingId === selectedClassId ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Update Exercise History</h3>
            <form onSubmit={handleUpdateHistory}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add notes..."
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

import React, { useEffect, useState } from 'react';
import { exerciseAPI } from '../../api';

type Exercise = {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
};

export function ExercisesSection() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const res = await exerciseAPI.list();
      setExercises(res.data || []);
    } catch (err) {
      console.error('Failed to fetch exercises', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', description: '' });
    setShowForm(true);
  };

  const openEdit = (ex: Exercise) => {
    setEditingId(ex.id);
    setForm({ name: ex.name, description: ex.description || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await exerciseAPI.update(editingId, { name: form.name, description: form.description });
      } else {
        await exerciseAPI.create({ name: form.name, description: form.description });
      }
      await fetchExercises();
      setShowForm(false);
    } catch (err: any) {
      console.error('Error saving exercise', err);
      alert(err.response?.data?.detail || 'Failed to save exercise');
    }
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Exercise Management</h2>
        <div className="space-x-2">
          <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">New Exercise</button>
          <button onClick={fetchExercises} className="bg-gray-200 px-3 py-2 rounded">Refresh</button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Exercise' : 'Create Exercise'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2" required />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded px-3 py-2" rows={4} />
            <div className="flex space-x-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Description</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-6 text-center">Loading...</td></tr>
            ) : exercises.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-500">No exercises yet.</td></tr>
            ) : (
              exercises.map((ex, idx) => (
                <tr key={`${ex.id ?? 'ex'}-${idx}`} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{ex.name}</td>
                  <td className="px-6 py-4">{ex.description}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button onClick={() => openEdit(ex)} className="text-blue-600 hover:underline">Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

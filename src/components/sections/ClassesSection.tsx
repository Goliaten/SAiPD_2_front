import React, { useEffect, useState } from 'react';
import { classAPI, userAPI, exerciseAPI } from '../../api';

type ClassItem = {
  id: number;
  name: string;
  date_from: string;
  date_to: string;
  is_active: boolean;
};

export function ClassesSection() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', date_from: '', date_to: '' });

  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showExercisesModal, setShowExercisesModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  // data for modals
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [classUsers, setClassUsers] = useState<any[]>([]);

  const [allExercises, setAllExercises] = useState<any[]>([]);
  const [classExercises, setClassExercises] = useState<any[]>([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await classAPI.list();
      setClasses(res.data || []);
    } catch (err) {
      console.error('Error fetching classes', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', date_from: '', date_to: '' });
    setShowForm(true);
  };

  const openEdit = (c: ClassItem) => {
    setEditingId(c.id);
    setForm({ name: c.name, date_from: c.date_from.slice(0, 16), date_to: c.date_to.slice(0, 16) });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        date_from: new Date(form.date_from).toISOString(),
        date_to: new Date(form.date_to).toISOString(),
      };

      if (editingId) {
        // backend update not implemented; attempt call and refresh list
        await classAPI.update(editingId, payload);
      } else {
        await classAPI.create(payload);
      }

      await fetchClasses();
      setShowForm(false);
    } catch (err: any) {
      console.error('Error saving class', err);
      alert(err.response?.data?.detail || 'Failed to save class');
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await classAPI.deactivate(id);
      setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, is_active: false } : c)));
    } catch (err) {
      console.error('Error deactivating class', err);
      alert('Failed to deactivate class');
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await classAPI.activate(id);
      setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, is_active: true } : c)));
    } catch (err) {
      console.error('Error activating class', err);
      alert('Failed to activate class');
    }
  };

  /* Users modal */
  const openUsersModal = async (classId: number) => {
    setSelectedClassId(classId);
    try {
      const [allRes, classRes] = await Promise.all([userAPI.list(), classAPI.get(classId)]);
      setAllUsers(allRes.data || []);
      setClassUsers(classRes.data.users || []);
      setShowUsersModal(true);
    } catch (err) {
      console.error('Error loading users for class', err);
      alert('Failed to load users');
    }
  };

  const addUserToClass = async (userId: number) => {
    if (!selectedClassId) return;
    try {
      await classAPI.addUser(selectedClassId, userId);
      setClassUsers((prev) => [...prev, allUsers.find((u) => u.id === userId)]);
    } catch (err) {
      console.error('Error adding user to class', err);
      alert('Failed to add user');
    }
  };

  const removeUserFromClass = async (userId: number) => {
    if (!selectedClassId) return;
    try {
      await classAPI.removeUser(selectedClassId, userId);
      setClassUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error('Error removing user from class', err);
      alert('Failed to remove user');
    }
  };

  /* Exercises modal */
  const openExercisesModal = async (classId: number) => {
    setSelectedClassId(classId);
    try {
      // fetch exercises list, class details and users (for teacher selector)
      const [allRes, classRes, usersRes] = await Promise.all([exerciseAPI.list(), classAPI.get(classId), userAPI.list()]);
      setAllExercises(allRes.data || []);
      setAllUsers(usersRes.data || []);

      const exercises = classRes.data.exercises || [];

      // Build a teacher id->login map from fetched users to avoid per-id requests
      const teacherMap: Record<number, string> = {};
      (usersRes.data || []).forEach((u: any) => {
        if (u && u.id) teacherMap[u.id] = u.login;
      });

      const exercisesWithTeacher = exercises.map((ex: any) => ({ ...ex, teacher_login: ex.teacher_id ? teacherMap[ex.teacher_id] || null : null }));
      setClassExercises(exercisesWithTeacher);
      setShowExercisesModal(true);
    } catch (err) {
      console.error('Error loading exercises for class', err);
      alert('Failed to load exercises');
    }
  };

  const addExerciseToClass = async (exerciseId: number, schedule: any) => {
    if (!selectedClassId) return;
    try {
      await classAPI.addExercise(selectedClassId, exerciseId, schedule);
      // Refresh class exercises
      const classRes = await classAPI.get(selectedClassId);
      setClassExercises(classRes.data.exercises || []);
    } catch (err) {
      console.error('Error adding exercise to class', err);
      alert('Failed to add exercise');
    }
  };

  const removeExerciseFromClass = async (exerciseId: number) => {
    // backend now expects class_exercise_id (relation id)
    const classExerciseId = exerciseId;
    try {
      await classAPI.removeExercise(classExerciseId);
      setClassExercises((prev) => prev.filter((ex) => ex.id !== classExerciseId));
    } catch (err) {
      console.error('Error removing exercise from class', err);
      alert('Failed to remove exercise');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Class Management</h2>
        <div className="space-x-2">
          <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">New Class</button>
          <button onClick={fetchClasses} className="bg-gray-200 px-3 py-2 rounded">Refresh</button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Class' : 'Create Class'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Class name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input type="datetime-local" value={form.date_from} onChange={(e) => setForm({ ...form, date_from: e.target.value })} className="border rounded px-3 py-2" required />
              <input type="datetime-local" value={form.date_to} onChange={(e) => setForm({ ...form, date_to: e.target.value })} className="border rounded px-3 py-2" required />
            </div>
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
              <th className="px-6 py-3 text-left">Id</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">From</th>
              <th className="px-6 py-3 text-left">To</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center">Loading...</td></tr>
            ) : classes.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">No classes yet.</td></tr>
            ) : (
              classes.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{c.id}</td>
                  <td className="px-6 py-4">{c.name}</td>
                  <td className="px-6 py-4">{new Date(c.date_from).toLocaleString()}</td>
                  <td className="px-6 py-4">{new Date(c.date_to).toLocaleString()}</td>
                  <td className="px-6 py-4">{c.is_active ? <span className="px-2 py-1 rounded bg-green-100 text-green-800">Active</span> : <span className="px-2 py-1 rounded bg-red-100 text-red-800">Inactive</span>}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button onClick={() => openEdit(c)} className="text-blue-600 hover:underline">Edit</button>
                    {c.is_active ? (
                      <button onClick={() => handleDeactivate(c.id)} className="text-red-600 hover:underline">Deactivate</button>
                    ) : (
                      <button onClick={() => handleActivate(c.id)} className="text-green-600 hover:underline">Activate</button>
                    )}
                    <button onClick={() => openUsersModal(c.id)} className="text-gray-700 hover:underline">Manage Users</button>
                    <button onClick={() => openExercisesModal(c.id)} className="text-gray-700 hover:underline">Manage Exercises</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Users Modal */}
      {showUsersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white w-3/4 max-w-3xl rounded shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Manage Users for Class #{selectedClassId}</h3>
              <button onClick={() => setShowUsersModal(false)} className="text-gray-600">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Assigned Users</h4>
                <ul className="space-y-2 max-h-64 overflow-auto">
                  {classUsers.map((u, idx) => (
                      <li key={`${u.id ?? 'u'}-${idx}`} className="flex justify-between items-center border p-2 rounded">
                      <div>{u.first_name} {u.last_name} <span className="text-sm text-gray-500">{u.email}</span></div>
                      <button onClick={() => removeUserFromClass(u.id)} className="text-red-600">Remove</button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">All Users</h4>
                <ul className="space-y-2 max-h-64 overflow-auto">
                  {allUsers.map((u, idx) => {
                    const assigned = classUsers.some((a) => a.id === u.id);
                    return (
                      <li key={`${u.id ?? 'a'}-${idx}`} className="flex justify-between items-center border p-2 rounded">
                        <div>{u.first_name} {u.last_name} <span className="text-sm text-gray-500">{u.email}</span></div>
                        {assigned ? <span className="text-gray-500">Assigned</span> : <button onClick={() => addUserToClass(u.id)} className="text-green-600">Add</button>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exercises Modal */}
      {showExercisesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white w-3/4 max-w-3xl rounded shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Manage Exercises for Class #{selectedClassId}</h3>
              <button onClick={() => setShowExercisesModal(false)} className="text-gray-600">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Assigned Exercises</h4>
                <ul className="space-y-2 max-h-64 overflow-auto">
                  {classExercises.map((ex, idx) => (
                    <li key={`${ex.id ?? 'ex'}-${idx}`} className="flex justify-between items-center border p-2 rounded">
                      <div>
                        <div className="font-medium">{ex.name}</div>
                        <div className="text-sm text-gray-500">
                          {ex.time_of_exercise ? `${ex.time_of_exercise}` : ''}
                          {ex.day_of_week ? ` • day: ${ex.day_of_week}` : ''}
                          {ex.week_interval ? ` • interval: ${ex.week_interval}` : ''}
                          {ex.week_offset ? ` • offset: ${ex.week_offset}` : ''}
                          {ex.teacher_login ? ` • teacher: ${ex.teacher_login}` : ''}
                        </div>
                      </div>
                      <button onClick={() => removeExerciseFromClass(ex.id)} className="text-red-600">Remove</button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Add Exercise</h4>
                <AddExerciseForm
                  exercises={allExercises}
                  teachers={allUsers}
                  onAdd={(exerciseId, schedule) => addExerciseToClass(exerciseId, schedule)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddExerciseForm({ exercises, teachers, onAdd }: { exercises: any[]; teachers: any[]; onAdd: (id: number, schedule: any) => void }) {
  const [selected, setSelected] = useState<number | null>(exercises[0]?.id || null);
  const [teacherId, setTeacherId] = useState<number | undefined>(undefined);
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [timeOfExercise, setTimeOfExercise] = useState<string>('08:00');
  const [weekInterval, setWeekInterval] = useState<number | undefined>(undefined);
  const [weekOffset, setWeekOffset] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (exercises.length && selected === null) setSelected(exercises[0].id);
  }, [exercises, selected]);

  return (
    <div>
      <select value={selected ?? ''} onChange={(e) => setSelected(Number(e.target.value))} className="w-full border rounded px-3 py-2 mb-2">
        {exercises.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
      </select>
      <label className="block text-sm text-gray-600">Teacher (optional)</label>
      <select value={teacherId ?? ''} onChange={(e) => setTeacherId(e.target.value ? Number(e.target.value) : undefined)} className="w-full border rounded px-3 py-2 mb-2">
        <option value="">-- none --</option>
        {teachers.map((t) => (
          <option key={t.id} value={t.id}>{t.login}</option>
        ))}
      </select>
      <label className="block text-sm text-gray-600">Day of week</label>
      <select value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))} className="w-full border rounded px-3 py-2 mb-2">
        {[1,2,3,4,5,6,7].map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <label className="block text-sm text-gray-600">Time</label>
      <input type="time" value={timeOfExercise} onChange={(e) => setTimeOfExercise(e.target.value)} className="w-full border rounded px-3 py-2 mb-2" />
      <input type="number" placeholder="Week interval (optional)" value={weekInterval ?? ''} onChange={(e) => setWeekInterval(e.target.value ? Number(e.target.value) : undefined)} className="w-full border rounded px-3 py-2 mb-2" />
      <input type="number" placeholder="Week offset (optional)" value={weekOffset ?? ''} onChange={(e) => setWeekOffset(e.target.value ? Number(e.target.value) : undefined)} className="w-full border rounded px-3 py-2 mb-2" />
      <button onClick={() => selected && onAdd(selected, { teacher_id: teacherId, day_of_week: dayOfWeek, time_of_exercise: timeOfExercise, week_interval: weekInterval, week_offset: weekOffset })} className="bg-green-600 text-white px-4 py-2 rounded">Add Exercise</button>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { userAPI, hashPassword } from '../../api';
import { useAuthStore } from '../../store';

export function UsersSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    login: '',
    email: '',
    password: '',
  });
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    is_active: undefined as boolean | undefined,
  });
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userAPI.list();
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData, password: hashPassword(formData.password) };
      await userAPI.add(dataToSend);
      const response = await userAPI.list();
      setUsers(response.data);
      setShowForm(false);
      setFormData({ first_name: '', last_name: '', login: '', email: '', password: '' });
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleEditClick = (user: any) => {
    setEditingUserId(user.id);
    setEditFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      password: '',
      is_active: !!user.is_active,
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setEditFormData({ ...editFormData, [name]: checked });
    } else {
      setEditFormData({ ...editFormData, [name]: value });
    }
  };

  const handleEditCancel = () => {
    setEditingUserId(null);
    setEditFormData({ first_name: '', last_name: '', email: '', password: '', is_active: undefined });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUserId == null) return;

    try {
      const payload: any = {};
      if (editFormData.first_name && editFormData.first_name.trim() !== '') payload.first_name = editFormData.first_name;
      if (editFormData.last_name && editFormData.last_name.trim() !== '') payload.last_name = editFormData.last_name;
      if (editFormData.email && editFormData.email.trim() !== '') payload.email = editFormData.email;
      if (typeof editFormData.is_active === 'boolean') payload.is_active = editFormData.is_active;
      if (editFormData.password && editFormData.password.trim() !== '') payload.password = hashPassword(editFormData.password);

      if (Object.keys(payload).length === 0) {
        alert('No updatable fields provided. Change at least one field.');
        return;
      }

      await userAPI.update(editingUserId, payload);

      // Update local state to reflect changes
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUserId ? { ...u, ...payload, is_active: payload.is_active !== undefined ? payload.is_active : u.is_active } : u))
      );

      handleEditCancel();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user. See console for details.');
    }
  };

  const handleDeactivate = async (id: number) => {
    // const currentUser = useAuthStore.getState().user;\
    if (currentUser){
        console.log("current user ", currentUser)
        console.log("own id ", currentUser.id);
        console.log("target user id ", id);
    }
    if (currentUser && currentUser.id === id) {
      // Prevent deactivating own account
      alert("You cannot deactivate your own account.");
      return;
    }

    try {
      await userAPI.deactivate(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: false } : u)));
    } catch (error) {
      console.error('Error deactivating user:', error);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await userAPI.activate(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: true } : u)));
    } catch (error) {
      console.error('Error activating user:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {showForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Create New User</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="first_name"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
                className="border border-gray-300 rounded px-3 py-2"
                required
              />
              <input
                type="text"
                name="last_name"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleChange}
                className="border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <input
              type="text"
              name="login"
              placeholder="Login"
              value={formData.login}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
            >
              Create User
            </button>
          </form>
        </div>
      )}

      {editingUserId !== null && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Update User</h3>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="first_name"
                placeholder="First Name"
                value={editFormData.first_name}
                onChange={handleEditChange}
                className="border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="text"
                name="last_name"
                placeholder="Last Name"
                value={editFormData.last_name}
                onChange={handleEditChange}
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={editFormData.email}
              onChange={handleEditChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <input
              type="password"
              name="password"
              placeholder="Password (leave blank to keep current)"
              value={editFormData.password}
              onChange={handleEditChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={!!editFormData.is_active}
                onChange={handleEditChange}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Active</span>
            </label>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Update User
              </button>
              <button
                type="button"
                onClick={handleEditCancel}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
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
              <th className="px-6 py-3 text-left">Login</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No users yet. Create one to get started.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{user.id}</td>
                  <td className="px-6 py-4">{user.first_name} {user.last_name}</td>
                  <td className="px-6 py-4">{user.login}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-sm ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => handleEditClick(user)}
                    >
                      Edit
                    </button>
                    {user.is_active ? (
                      user.id === currentUser?.id ? (
                        <button className="text-gray-400 cursor-not-allowed" disabled title="You cannot deactivate your own account">Deactivate</button>
                      ) : (
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => handleDeactivate(user.id)}
                        >
                          Deactivate
                        </button>
                      )
                    ) : (
                      <button
                        className="text-green-600 hover:underline"
                        onClick={() => handleActivate(user.id)}
                      >
                        Activate
                      </button>
                    )}
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

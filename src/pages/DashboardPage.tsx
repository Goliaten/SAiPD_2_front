import { useState } from 'react';
import { Navbar } from '../components/Navbar';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'roles', label: 'Roles', icon: '🔐' },
  { id: 'classes', label: 'Classes', icon: '📚' },
  { id: 'exercises', label: 'Exercises', icon: '📝' },
  { id: 'attendance', label: 'Attendance', icon: '✓' },
  { id: 'grading', label: 'Grading', icon: '📊' },
  { id: 'messages', label: 'Messages', icon: '💬' },
  { id: 'tasks', label: 'Tasks', icon: '☑️' },
];

export function DashboardPage() {
  const [activeSection, setActiveSection] = useState('users');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Menu</h2>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-left px-4 py-2 rounded transition ${
                  activeSection === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeSection === 'users' && <UsersSection />}
          {activeSection === 'roles' && <RolesSection />}
          {activeSection === 'classes' && <ClassesSection />}
          {activeSection === 'exercises' && <ExercisesSection />}
          {activeSection === 'attendance' && <AttendanceSection />}
          {activeSection === 'grading' && <GradingSection />}
          {activeSection === 'messages' && <MessagesSection />}
          {activeSection === 'tasks' && <TasksSection />}
        </div>
      </div>
    </div>
  );
}

function UsersSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

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
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                className="border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <input
              type="text"
              placeholder="Login"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border border-gray-300 rounded px-3 py-2"
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
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
                  <td className="px-6 py-4">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-6 py-4">{user.login}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button className="text-blue-600 hover:underline">
                      Edit
                    </button>
                    <button className="text-red-600 hover:underline">
                      Deactivate
                    </button>
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

function RolesSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Role Management</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Coming soon: Create, modify, and manage roles with permissions
        </p>
      </div>
    </div>
  );
}

function ClassesSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Class Management</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Coming soon: Create classes, assign users, and manage exercises
        </p>
      </div>
    </div>
  );
}

function ExercisesSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Exercise Management</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Coming soon: Create and manage exercises
        </p>
      </div>
    </div>
  );
}

function AttendanceSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Attendance</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Coming soon: Track student attendance
        </p>
      </div>
    </div>
  );
}

function GradingSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Grading</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Coming soon: Assign grades to students
        </p>
      </div>
    </div>
  );
}

function MessagesSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Messages</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Coming soon: Send and receive messages
        </p>
      </div>
    </div>
  );
}

function TasksSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Tasks</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Coming soon: Manage tasks and assignments
        </p>
      </div>
    </div>
  );
}

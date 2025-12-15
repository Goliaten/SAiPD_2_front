import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { UsersSection } from '../components/sections/UsersSection';
import { RolesSection } from '../components/sections/RolesSection';
import { ClassesSection } from '../components/sections/ClassesSection';
import { ExercisesSection } from '../components/sections/ExercisesSection';
import { AttendanceSection } from '../components/sections/AttendanceSection';
import { GradingSection } from '../components/sections/GradingSection';
import { MessagesSection } from '../components/sections/MessagesSection';
import { TasksSection } from '../components/sections/TasksSection';

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

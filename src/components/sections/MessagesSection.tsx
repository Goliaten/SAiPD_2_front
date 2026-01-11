import React, { useEffect, useState } from 'react';
import { messageAPI, userAPI } from '../../api';
import { useAuthStore } from '../../store';

type Message = {
  id: number;
  user_id: number;
  sender_id: number;
  title: string;
  content: string;
  created_date: string;
  modified_date: string;
};

type User = {
  id: number;
  first_name: string;
  last_name: string;
  login: string;
};

export function MessagesSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(20);
  const [filterType, setFilterType] = useState<'received' | 'sent'>('received');

  const currentUser = useAuthStore((s) => s.user);

  const [formData, setFormData] = useState({
    user_id: '',
    title: '',
    content: '',
  });

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, [skip, limit, filterType]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const filters: any = { skip, limit };
      if (filterType === 'received' && currentUser) {
        filters.user_id = currentUser.id;
      } else if (filterType === 'sent' && currentUser) {
        filters.sender_id = currentUser.id;
      }
      const response = await messageAPI.list(skip, limit, filters);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const dataToSend = {
        user_id: parseInt(formData.user_id),
        sender_id: currentUser.id,
        title: formData.title,
        content: formData.content,
      };

      await messageAPI.create(dataToSend);
      setShowForm(false);
      setFormData({ user_id: '', title: '', content: '' });
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await messageAPI.delete(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error deleting message');
    }
  };

  const getSenderName = (senderId: number) => {
    const user = users.find((u) => u.id === senderId);
    return user ? `${user.first_name} ${user.last_name}` : `User ${senderId}`;
  };

  const getRecipientName = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : `User ${userId}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Messages</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {showForm ? 'Cancel' : 'New Message'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Send New Message</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient
                </label>
                <select
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select recipient...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.login})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Message subject"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Message content"
                  required
                  rows={4}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              setFilterType('received');
              setSkip(0);
            }}
            className={`px-4 py-2 rounded ${
              filterType === 'received'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Received
          </button>
          <button
            onClick={() => {
              setFilterType('sent');
              setSkip(0);
            }}
            className={`px-4 py-2 rounded ${
              filterType === 'sent'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Sent
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-500">No messages found</p>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className="border border-gray-200 rounded p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{message.title}</p>
                    <p className="text-sm text-gray-600">
                      {filterType === 'received'
                        ? `From: ${getSenderName(message.sender_id)}`
                        : `To: ${getRecipientName(message.user_id)}`}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(message.created_date)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(message.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-gray-700">{message.content}</p>
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
            disabled={messages.length < limit}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

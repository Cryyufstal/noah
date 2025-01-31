'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          // ترتيب المستخدمين حسب عدد النقاط (تنازليًا)
          const sortedUsers = (data.users || []).sort((a: any, b: any) => b.points - a.points);
          setUsers(sortedUsers);
        }
      })
      .catch((err) => {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users');
      });
  }, []);

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen justify-between bg-gradient-to-b from-gray-900 via-black to-gray-800 text-white">
      {/* محتوى الصفحة */}
      <div className="p-6">
        {/* عنوان */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-500">Admin Dashboard</h1>
          <p className="text-lg text-gray-300 mt-2">List of all users sorted by points</p>
        </div>

        {/* التحقق من توفر المستخدمين */}
        {users.length === 0 ? (
          <div className="text-center text-gray-400">No users available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-700">
              <thead>
                <tr className="bg-gray-800 text-gray-300">
                  <th className="border border-gray-700 px-4 py-2">#</th>
                  <th className="border border-gray-700 px-4 py-2">User</th>
                  <th className="border border-gray-700 px-4 py-2">Points</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={index} className="text-center even:bg-gray-800 odd:bg-gray-900">
                    <td className="border border-gray-700 px-4 py-2 font-bold text-gray-400">
                      {index + 1} {/* ترتيب المستخدمين بالأرقام */}
                    </td>
                    <td className="border border-gray-700 px-4 py-2">{user.username || 'Unknown'}</td>
                    <td className="border border-gray-700 px-4 py-2 text-green-400 font-semibold">
                      {user.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

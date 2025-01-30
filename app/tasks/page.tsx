'use client';

import { useEffect, useState } from 'react';
import BottomNavigation from '@/components/BottomNavigation';

interface Task {
  id: number;
  title: string;
  url: string;
  points: number;
  completed: boolean;
}

const initialTasks: Task[] = [
  { id: 1, title: 'Visit Website A', url: 'https://example.com', points: 10, completed: false },
  { id: 2, title: 'Follow on Twitter', url: 'https://twitter.com', points: 5, completed: false },
  { id: 3, title: 'Join Telegram Group', url: 'https://t.me/example', points: 8, completed: false },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    const savedPoints = localStorage.getItem('userPoints');

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks(initialTasks);
    }

    if (savedPoints) {
      setUserPoints(Number(savedPoints));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
      localStorage.setItem('userPoints', userPoints.toString());
    }
  }, [tasks, userPoints, user]);

  useEffect(() => {
    fetch('/api/user')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setUser(data);
          setUserPoints(data.points || 0);
        }
      })
      .catch((err) => {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data');
      });
  }, []);

  const handleOpenTask = (id: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: true } : task
      )
    );
  };

  const handleCompleteTask = async (id: number, points: number) => {
    const newPoints = userPoints + points;
    setUserPoints(newPoints);
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));

    await fetch('/api/update-points', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegramId: user?.telegramId,
        points: newPoints,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error('Error updating points:', data.error);
        } else {
          console.log('Points updated successfully');
        }
      })
      .catch((err) => {
        console.error('Error updating points:', err);
      });
  };

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  if (!user) return <div className="container mx-auto p-4">Loading...</div>;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">Tasks</h1>

      <div className="mb-4 text-lg font-medium">
        Your Points: <span className="text-green-400">{userPoints}</span>
      </div>

      <ul className="w-full max-w-lg bg-gray-800 rounded-lg shadow-lg">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex justify-between items-center p-4 border-b border-gray-700 last:border-none"
          >
            <span className="text-lg font-semibold">{task.title}</span>
            {!task.completed ? (
              <button
                onClick={() => {
                  window.open(task.url, '_blank');
                  handleOpenTask(task.id);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded transition-all"
              >
                Task
              </button>
            ) : (
              <button
                onClick={() => handleCompleteTask(task.id, task.points)}
                className="bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded transition-all"
              >
                Check
              </button>
            )}
          </li>
        ))}
      </ul>
      <BottomNavigation />
    </main>
  );
}

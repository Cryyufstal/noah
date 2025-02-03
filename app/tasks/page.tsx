'use client';

import { useEffect, useState } from 'react';
import BottomNavigation from '@/components/BottomNavigation';

type Task = {
  id: number;
  title: string;
  completed: boolean;
  permanent?: boolean;
  url?: string; // جعل الخاصية اختيارية
  points?: number; // جعل الخاصية اختيارية
};

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

export default function TasksPage() {
  const defaultTasks: Task[] = [
  { id: 1, title: "Complete this task", completed: false, url: "", points: 100 },
  { id: 2, title: "invite 3 friends", completed: false, url: "@/app/game", points: 2000 },
  { id: 3, title: "invite 5 friends", completed: false, url: "@/app/game", points: 10000 },
  { id: 4, title: "invite 10 friends", completed: false, url: "@/app/game", points: 20000 },
  { id: 7, title: "soon...", completed:false , url: "", points: 1000 },
];

  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [userPoints, setUserPoints] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ تحميل بيانات المستخدم من Telegram
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();

      const initDataUnsafe = tg.initDataUnsafe || {};

      if (initDataUnsafe.user) {
        fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(initDataUnsafe.user),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              setError(data.error);
            } else {
              console.log("✅ User data loaded:", data);
              setUser(data);
              setUserPoints(data.points || 0);
            }
          })
          .catch((err) => {
            console.error('❌ Error fetching user data:', err);
            setError('Failed to fetch user data');
          });
      } else {
        setError('No user data available');
      }
    } else {
      setError('This app should be opened in Telegram');
    }
  }, []);

  // ✅ تحميل المهام من localStorage بعد تحميل user
  useEffect(() => {
  if (user?.telegramId) {
    const savedTasks = localStorage.getItem(`tasks_${user.telegramId}`);

    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      console.log("📂 Loaded tasks from localStorage:", parsedTasks);
      setTasks(parsedTasks.length > 0 ? parsedTasks : defaultTasks);
    } else {
      console.log("🆕 No tasks found in localStorage. Doing nothing.");
      // لا تفعل أي شيء هنا، مجرد طباعة رسالة في وحدة التحكم
    }
  }
}, [user?.telegramId]);
 // 🔥 سيتم تشغيله فقط عند تغير user

  // ✅ حفظ المهام عند تغييرها لكل مستخدم بناءً على telegramId
  useEffect(() => {
  if (user?.telegramId) {
    console.log("💾 Saving tasks to localStorage:", tasks);
    localStorage.setItem(`tasks_${user.telegramId}`, JSON.stringify(tasks));
  }
}, [tasks, user]);


  const handleOpenTask = (id: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: true } : task
      )
    );
  };

  const [totalReferrals, setTotalReferrals] = useState<number>(0);


  useEffect(() => {
    const fetchTotalReferrals = async () => {
      if (userId) {
        try {
          const response = await fetch(`/api/referrals?userId=${userId}`);
          const data = await response.json();

          if (data.error) {
            console.error(data.error);
          } else {
            setTotalReferrals(data.total_referrals || 0);
          }
        } catch (error) {
          console.error("Error fetching total referrals:", error);
        }
      }
    };

    fetchTotalReferrals();
  }, [userId]);


const handleCompleteTask = async (id: number, points: number) => {
  const newPoints = userPoints + points;

  // تحديث النقاط
  setUserPoints(newPoints);

  // إزالة المهمة المكتملة وتحديث القائمة
  const updatedTasks = tasks.filter((task) => task.id !== id);
  setTasks(updatedTasks);

  // تحديث `localStorage`
  if (user?.telegramId) {
    localStorage.setItem(`tasks_${user.telegramId}`, JSON.stringify(updatedTasks));
  }

  // تحديث النقاط في الخادم
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
        console.error('❌ Error updating points:', data.error);
      } else {
        console.log('✅ Points updated successfully');
      }
    })
    .catch((err) => {
      console.error('❌ Error updating points:', err);
    });
};

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

   if (!user) return (
 <div className="flex justify-center items-center w-full h-screen bg-gray-900">
  
  </div>
)

  return (
  <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
    <h1 className="text-4xl font-bold mb-6">Tasks</h1>

    <div className="mb-4 text-lg font-medium">
      Your Points: <span className="text-green-400">{userPoints}</span>
    </div>

    <ul className="w-full max-w-lg bg-gray-800 rounded-lg shadow-lg">
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <li
            key={task.id}
            className="flex justify-between items-center p-4 border-b border-gray-700 last:border-none"
          >
            <span className="text-lg font-semibold">
              {task.title} - {task.points}
            </span>

            {!task.completed ? (
              task.id === 7 ? (
                <button
                  disabled
                  className="bg-gray-500 text-white py-1 px-4 rounded cursor-not-allowed"
                >
                  Not Available
                </button>
              ) : (
                <button
                  onClick={() => {
                    window.open(task.url, "_blank");
                    handleOpenTask(task.id);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded transition-all"
                >
                  Start
                </button>
              )
            ) : (
              <button
                onClick={() => handleCompleteTask(task.id, task.points ?? 0)}
                disabled={
                  (task.id === 2 && totalReferrals <= 3) ||
                  (task.id === 3 && totalReferrals <= 5) ||
                  (task.id === 4 && totalReferrals <= 10) ||
                  task.id === 7
                }
                className={`py-1 px-4 rounded transition-all text-white ${
                  (task.id === 2 && totalReferrals <= 3) ||
                  (task.id === 3 && totalReferrals <= 5) ||
                  (task.id === 4 && totalReferrals <= 10) ||
                  task.id === 7
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                Check
              </button>
            )}
          </li>
        ))
      ) : (
        <li className="text-center text-gray-400 p-4">No tasks available.</li>
      )}
    </ul>

    <BottomNavigation />
  </main>
);
  } 

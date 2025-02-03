'use client';

import { useEffect, useState } from 'react';
import BottomNavigation from '@/components/BottomNavigation'; // استيراد الشريط السفلي

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [points, setPoints] = useState<number>(38380); // تعيين النقاط الافتراضية لتكون مثل التصميم

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();

      const initDataUnsafe = tg.initDataUnsafe || {};

      if (initDataUnsafe.user) {
        const urlParams = new URLSearchParams(window.location.search);
        const referrer = urlParams.get('start') || null;

        fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...initDataUnsafe.user,
            referrer,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              setError(data.error);
            } else {
              setUser(data);
              setPoints(data.points || 0);
            }
          })
          .catch((err) => {
            console.error('Error fetching user data:', err);
            setError('Failed to fetch user data');
          });
      } else {
        setError('No user data available');
      }
    } else {
      setError('This app should be opened in Telegram');
    }
  }, []);

  const handleImageClick = () => {
    const newPoints = points + 1;
    setPoints(newPoints);

    fetch('/api/increase-points', {
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

  if (!user) {
    return (
      <div className="flex justify-center items-center w-full h-screen bg-gray-900">
        
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen justify-between bg-gradient-to-b from-gray-900 via-black to-gray-800 text-white">
      {/* محتوى الصفحة */}
      <div className="p-6 flex flex-col items-center">
        {/* واجهة المستخدم */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-300">TREx</h1>
          <p className="text-lg text-gray-400">
             {user.username}
          </p>
        </div>

        {/* صندوق النقاط */}
        <div className="bg-black rounded-xl p-8 shadow-lg text-center w-full max-w-sm">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            {points.toLocaleString()} <span className="text-yellow-400">TREx</span>
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            CHAMP <span className="text-yellow-500">🏆</span> 
          </p>
          <img
            src="/images/dog.png" // استبدل هذه الصورة بالصورة التي ترغب بها
            alt="Dog icon"
            className="w-50 h-50 mx-auto mb-4 cursor-pointer transition-transform transform hover:scale-105"
            onClick={handleImageClick}
          />
        </div>
      </div>

      {/* شريط سفلي */}
      <BottomNavigation />
    </div>
  );
}

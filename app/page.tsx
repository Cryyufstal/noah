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
  const [points, setPoints] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();

      const initDataUnsafe = tg.initDataUnsafe || {};

      if (initDataUnsafe.user) {
        // استخراج معلمة start من رابط التطبيق
        const urlParams = new URLSearchParams(window.location.search);
        const referrer = urlParams.get('start') || null;

        // إرسال بيانات المستخدم إلى الخادم مع رابط الإحالة
        fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...initDataUnsafe.user,
            referrer, // إرسال رابط الإحالة المستخرج
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              setError(data.error);
            } else {
              setUser(data);
              setPoints(data.points || 0); // إعداد النقاط من البيانات القادمة
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
    // إعادة تحميل الصفحة عند النقر على الصورة
    window.location.reload();
  };

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  if (!user) return <div className="container mx-auto p-4">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen justify-between bg-gradient-to-b from-gray-900 via-black to-gray-800 text-white">
      {/* محتوى الصفحة */}
      <div className="p-6">
        {/* عنوان مرحب */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-blue-500">Welcome, {user.firstName}!</h1>
          <p className="text-3xl text-gray-300 mt-2"><span className="text-green-400 font-bold">{points}</span>$MY</p>
        </div>

        {/* بطاقة النقاط */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg text-center border border-gray-700">
          <p className="text-xl font-medium text-gray-300 mb-4">Click the image below to earn points!</p>
          <img
            src="/images/dog.png"
            alt="Click to earn points"
            className="cursor-pointer mx-auto w-48 h-48 rounded-xl shadow-md transition-transform duration-300 hover:scale-110"
            onClick={handleImageClick}
          />
        </div>
      </div>

      {/* شريط سفلي */}
      <BottomNavigation />
    </div>
  );
}


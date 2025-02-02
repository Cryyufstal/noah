"use client";

import BottomNavigation from '@/components/BottomNavigation';
import ReferralSystem from '@/components/ReferralSystem';
import { useEffect, useState } from 'react';

export default function Home() {
  const [initData, setInitData] = useState('');
  const [userId, setUserId] = useState('');
  const [startParam, setStartParam] = useState('');
  const [totalReferrals, setTotalReferrals] = useState(0); // عدد الأشخاص المدعوين

  useEffect(() => {
    const initWebApp = async () => {
      if (typeof window !== 'undefined') {
        const WebApp = (await import('@twa-dev/sdk')).default;
        WebApp.ready();
        setInitData(WebApp.initData);
        
        const initDataUnsafe = WebApp.initDataUnsafe || {};
        const userIdString = initDataUnsafe.user?.id?.toString() || '';
        setUserId(userIdString);
        setStartParam(initDataUnsafe.start_param || '');
      }
    };

    initWebApp();
  }, []);

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
          console.error('Error fetching total referrals:', error);
        }
      }
    };

    fetchTotalReferrals();
  }, [userId]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-6 text-white">
      <div className="bg-gray-800 shadow-lg rounded-2xl w-full max-w-3xl p-6 text-center">
        <img
            src="/images/invit.png" // استبدل هذه الصورة بالصورة التي ترغب بها
            alt="invite icon"
            className="w-23 h-23 mx-auto mb-4 cursor-pointer transition-transform transform hover:scale-105"
          />
        <p className="text-gray-300 text-lg mb-8">
          invite frends . earn more TREx points
        </p> 
        

        {/* المكون الخاص بنظام الإحالة */}
        <ReferralSystem initData={initData} userId={userId} startParam={startParam} />

        {/* عرض عدد الأشخاص المدعوين */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-300">Total Referrals:</h2>
          <p className="text-3xl font-semibold text-blue-400">{totalReferrals}</p>
        </div>
      </div>

      {/* الشريط السفلي */}
      <BottomNavigation />
    </main>
  );
}

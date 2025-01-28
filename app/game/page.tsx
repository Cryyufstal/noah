"use client";

import BottomNavigation from '@/components/BottomNavigation';
import ReferralSystem from '@/components/ReferralSystem';
import { useEffect, useState } from 'react';

export default function Home() {
  const [initData, setInitData] = useState('');
  const [userId, setUserId] = useState('');
  const [startParam, setStartParam] = useState('');
  const [referrals, setReferrals] = useState<any[]>([]); // لحفظ الأشخاص المدعوين

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
    const fetchReferrals = async () => {
      if (userId) {
        try {
          const response = await fetch(`/api/ref?userId=${userId}`);
          const data = await response.json();

          if (data.error) {
            console.error(data.error);
          } else {
            setReferrals(data.referrals || []);
          }
        } catch (error) {
          console.error('Error fetching referrals:', error);
        }
      }
    };

    fetchReferrals();
  }, [userId]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-6 text-white">
      <div className="bg-gray-800 shadow-lg rounded-2xl w-full max-w-3xl p-6 text-center">
        <h1 className="text-4xl font-bold mb-6 text-blue-400">
          Telegram Referral
        </h1>
        <p className="text-gray-300 text-lg mb-8">
          Welcome to the referral system. Connect with your audience and share referral links seamlessly!
        </p>

        {/* المكون الخاص بنظام الإحالة */}
        <ReferralSystem initData={initData} userId={userId} startParam={startParam} />

        {/* الجزء السفلي: عرض الأشخاص المدعوين من قبل المستخدم */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-300">People You Referred:</h2>
          {referrals.length > 0 ? (
            <ul>
              {referrals.map((referral, index) => (
                <li key={index} className="bg-gray-700 p-3 rounded mb-2">
                  User {referral.firstName} (TelegramID: {referral.telegramId})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No referrals yet.</p>
          )}
        </div>
      </div>

      {/* الشريط السفلي */}
      <BottomNavigation />
    </main>
  );
}

"use client";

import BottomNavigation from '@/components/BottomNavigation';
import ReferralSystem from '@/components/ReferralSystem';
import { useEffect, useState } from 'react';

export default function Home() {
  const [initData, setInitData] = useState('');
  const [userId, setUserId] = useState('');
  const [startParam, setStartParam] = useState('');
  const [referrer, setReferrer] = useState<string | null>(null);

  useEffect(() => {
    const initWebApp = async () => {
      if (typeof window !== 'undefined') {
        const WebApp = (await import('@twa-dev/sdk')).default;
        WebApp.ready();
        setInitData(WebApp.initData);
        const userIdString = WebApp.initDataUnsafe.user?.id.toString() || '';
        setUserId(userIdString);
        setStartParam(WebApp.initDataUnsafe.start_param || '');
        const referrerString = WebApp.initDataUnsafe.referrer || null;
        setReferrer(referrerString);
      }
    };

    initWebApp();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-6 text-white">
      <div className="bg-gray-800 shadow-lg rounded-2xl w-full max-w-3xl p-6 text-center">
        <h1 className="text-4xl font-bold mb-6 text-blue-400">
          Telegram Referral
        </h1>
        <p className="text-gray-300 text-lg mb-8">
          Welcome to the referral system. Connect with your audience and share referral links seamlessly!
        </p>
        
        {/* Display referrer */}
        {referrer && (
          <div className="text-gray-300 mb-4">
            <p>You were referred by user: <span className="text-green-400">{referrer}</span></p>
          </div>
        )}

        {/* Referral system component */}
        <ReferralSystem initData={initData} userId={userId} startParam={startParam} />

        {/* Bottom Section: Display people referred by the user */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-300">People You Referred:</h2>
          {/* Logic to fetch and display the list of people invited by the user */}
          {/* You need to pass this list from the `ReferralSystem` component */}
          {/* If there are any referrals, display them */}
          <ul>
            {/* Example of referral display */}
            {/* You need to fetch referrals based on the `userId` and display it */}
            {/* This part should be dynamically filled with data */}
            <li className="bg-gray-700 p-3 rounded mb-2">User1 (TelegramID: xyz123)</li>
            <li className="bg-gray-700 p-3 rounded mb-2">User2 (TelegramID: abc456)</li>
          </ul>
        </div>
      </div>

      {/* Bottom navigation */}
      <BottomNavigation />
    </main>
  );
}

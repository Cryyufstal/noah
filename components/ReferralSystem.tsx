import { useState, useEffect } from 'react'

import { initUtils } from '@telegram-apps/sdk'

interface ReferralSystemProps {
  initData: string
  userId: string
  startParam: string
}

const ReferralSystem: React.FC<ReferralSystemProps> = ({ initData, userId, startParam }) => {
  const [referrals, setReferrals] = useState<string[]>([])
  const [referrer, setReferrer] = useState<string | null>(null)
  const INVITE_URL = "https://t.me/newtestine_bot/reffer/"

  useEffect(() => {
    const checkReferral = async () => {
      if (startParam && userId) {
        try {
          // إرسال بيانات الإحالة إلى الخادم
          const response = await fetch('/api/referrals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, referrerId: startParam }), // إرسال بيانات الإحالة
          });

          if (!response.ok) throw new Error('Failed to save referral');
        } catch (error) {
          console.error('Error saving referral:', error);
        }
      }
    }

    const fetchReferrals = async () => {
      if (userId) {
        try {
          // جلب الإحالات من الخادم
          const response = await fetch(`/api/referrals?userId=${userId}`);
          if (!response.ok) throw new Error('Failed to fetch referrals');
          const data = await response.json();
          setReferrals(data.referrals || []); // التعامل مع بيانات الإحالات
          setReferrer(data.referrer || null); // التعامل مع معرف الشخص المحال
        } catch (error) {
          console.error('Error fetching referrals:', error);
        }
      }
    }

    checkReferral();
    fetchReferrals();
  }, [userId, startParam])

  const handleInviteFriend = () => {
    const utils = initUtils()
    const inviteLink = `${INVITE_URL}?startapp=${userId}`
    const shareText = `Join me on this awesome Telegram mini app!`
    const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`
    utils.openTelegramLink(fullUrl)
  }

  const handleCopyLink = () => {
    const inviteLink = `${INVITE_URL}?startapp=${userId}`
    navigator.clipboard.writeText(inviteLink)
  }
  return (
    <div className="w-full max-w-md">
      {referrer && (
        <p className="text-green-500 mb-4">You were referred by user {referrer}</p>
      )}
      <div className="flex flex-col space-y-4">
<button
  onClick={handleInviteFriend}
  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl text-lg"
>
  Invite Friend
</button>
      </div>
      {referrals.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Your Referrals</h2>
          <ul>
            {referrals.map((referral, index) => (
              <li key={index} className="bg-gray-100 p-2 mb-2 rounded">
                User {referral}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ReferralSystem


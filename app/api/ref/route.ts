// app/api/referrals/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // تأكد من إعداد Prisma بشكل صحيح

export async function GET(request: Request) {
  try {
    // الحصول على userId من المعاملات
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // استعلام قاعدة البيانات للحصول على الأشخاص الذين تمت دعوتهم بواسطة المستخدم الحالي
    const user = await prisma.user.findUnique({
      where: { telegramId: parseInt(userId) }, // أو String إذا كان النوع String
      include: {
        referrals: true, // افتراضياً لدينا علاقة بين المستخدمين
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // إرسال البيانات إلى العميل
    return NextResponse.json({
      referrals: user.referrals,
      referrer: user.referrer,
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 });
  }
}


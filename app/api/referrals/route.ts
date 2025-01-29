import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId, referrerId } = await req.json();

    if (!userId || !referrerId) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const userIdNumber = Number(userId);
    const referrerIdNumber = Number(referrerId);

    if (isNaN(userIdNumber) || isNaN(referrerIdNumber)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    // تحقق مما إذا كان المستخدم مسجلاً بالفعل بمحيل
    const existingUser = await prisma.user.findUnique({
      where: { telegramId: userIdNumber },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (existingUser.referrer) {
      return NextResponse.json({ error: 'User already has a referrer' }, { status: 400 });
    }

    // تحديث بيانات المستخدم وتسجيل الإحالة
    const updatedUser = await prisma.user.update({
      where: { telegramId: userIdNumber },
      data: { referrer: referrerIdNumber },
    });

    // التحقق من وجود المحيل وإضافة النقاط مرة واحدة فقط
    const referrer = await prisma.user.findUnique({
      where: { telegramId: referrerIdNumber },
    });

    if (referrer) {
      await prisma.user.update({
        where: { telegramId: referrerIdNumber },
        data: {
          points: referrer.points + 500, // إضافة النقاط مرة واحدة فقط
          total_referral: (referrer.total_referral || 0) + 1, // زيادة عدد الإحالات بمقدار 1
        },
      });
    }

    return NextResponse.json({ message: 'Referral registered and points updated' });
  } catch (error) {
    console.error('Error saving referral:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

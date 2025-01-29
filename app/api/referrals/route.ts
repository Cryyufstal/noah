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

    // تسجيل الإحالة
    await prisma.user.update({
      where: { telegramId: userIdNumber },
      data: { referrer: referrerIdNumber },
    });

    // 🔥 استدعاء API النقاط تلقائيًا
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/ref?userId=${userIdNumber}`, {
      method: 'GET',
    });

    return NextResponse.json({ message: 'Referral registered and referrer updated' });
  } catch (error) {
    console.error('Error saving referral:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

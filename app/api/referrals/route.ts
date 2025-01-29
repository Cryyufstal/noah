import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ✅ دالة GET: استرجاع عدد الإحالات للمستخدم
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: Number(userId) },
      select: { total_referral: true }, // فقط استرجاع عدد الإحالات
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ total_referrals: user.total_referral || 0 });
  } catch (error) {
    console.error('Error fetching total referrals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ✅ دالة POST: تسجيل إحالة جديدة وزيادة النقاط
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
    await prisma.user.update({
      where: { telegramId: userIdNumber },
      data: { referrer: referrerIdNumber },
    });

    // التحقق من وجود المحيل وإضافة النقاط
    const referrer = await prisma.user.findUnique({
      where: { telegramId: referrerIdNumber },
    });

    if (referrer) {
      await prisma.user.update({
        where: { telegramId: referrerIdNumber },
        data: {
          points: referrer.points + 500, // إضافة النقاط للمحيل
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


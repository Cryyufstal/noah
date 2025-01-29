import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // تأكد من أن هذا هو المسار الصحيح لمكتبة Prisma

export async function GET(request: Request) {
  try {
    // الحصول على userId من الاستعلام باستخدام URLSearchParams
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const referrerId = url.searchParams.get('referrerId'); // الحصول على ID المحيل

    if (!userId) {
      return NextResponse.json({ message: 'UserId is required' }, { status: 400 });
    }

    // البحث عن المستخدم في قاعدة البيانات
    const user = await prisma.user.findUnique({
      where: { telegramId: parseInt(userId) },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // إذا كان للمستخدم بالفعل محيل، لا نقوم بتغييره ولا نضيف نقاط
    if (user.referrer) {
      return NextResponse.json({ message: 'User already has a referrer. No changes made.' });
    }

    // التأكد من أن referrerId موجود وليس نفس المستخدم
    if (referrerId && referrerId !== userId) {
      // البحث عن المحيل
      const referrer = await prisma.user.findUnique({
        where: { telegramId: parseInt(referrerId) },
      });

      if (referrer) {
        // تحديث المستخدم وإضافة المحيل له **مرة واحدة فقط**
        await prisma.user.update({
          where: { telegramId: parseInt(userId) },
          data: { referrer: parseInt(referrerId) },
        });

        // إضافة 500 نقطة للمحيل **مرة واحدة فقط**
        await prisma.user.update({
          where: { telegramId: parseInt(referrerId) },
          data: { points: referrer.points + 500 },
        });

        return NextResponse.json({
          message: `User ${userId} has been linked to referrer ${referrerId}, and 500 points were awarded.`,
        });
      } else {
        return NextResponse.json({ message: 'Referrer not found' }, { status: 404 });
      }
    }

    return NextResponse.json({ message: 'No referrer provided or invalid referrer ID' }, { status: 400 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}


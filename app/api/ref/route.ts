import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const referrerId = url.searchParams.get('referrerId');

    if (!userId) {
      return NextResponse.json({ message: 'UserId is required' }, { status: 400 });
    }

    // تحويل القيم إلى أرقام صحيحة
    const userIdNumber = parseInt(userId);
    const referrerIdNumber = referrerId ? parseInt(referrerId) : null; // التأكد من عدم تحويل null إلى NaN

    // البحث عن المستخدم في قاعدة البيانات
    const user = await prisma.user.findUnique({
      where: { telegramId: userIdNumber },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // التحقق مما إذا كان لدى المستخدم محيل بالفعل
    if (!user.referrer && referrerIdNumber) {
      await prisma.user.update({
        where: { telegramId: userIdNumber },
        data: { referrer: referrerIdNumber }, // ✅ تم تحويله إلى رقم صحيح
      });

      // التحقق مما إذا كان المحيل موجودًا
      const referrer = await prisma.user.findUnique({
        where: { telegramId: referrerIdNumber },
      });

      if (referrer) {
        // إضافة 500 نقطة للمحيل مرة واحدة فقط
        await prisma.user.update({
          where: { telegramId: referrerIdNumber },
          data: { points: referrer.points + 500 },
        });

        return NextResponse.json({
          message: `Referral recorded successfully! 500 points added to referrer ${referrerIdNumber}.`,
        });
      } else {
        return NextResponse.json({ message: 'Referrer not found' }, { status: 404 });
      }
    } else {
      return NextResponse.json({ message: 'User already has a referrer or no referrer provided.' });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}


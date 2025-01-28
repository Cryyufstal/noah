import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // تأكد من أن هذا هو المسار الصحيح لمكتبة Prisma

export async function GET(request: Request) {
  try {
    const { userId } = request.url.split('?userId=')[1]; // افتراضًا الحصول على userId من الاستعلام

    // البحث عن المستخدم باستخدام userId
    const user = await prisma.user.findUnique({
      where: { telegramId: parseInt(userId) }, // تحويل userId إلى عدد إذا كان عددًا
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // استخراج المحيل (referrer) من المستخدم الحالي
    const referrerId = user.referrer;

    if (referrerId) {
      // البحث عن المستخدم الذي أرسل الدعوة
      const referrer = await prisma.user.findUnique({
        where: { telegramId: parseInt(referrerId) }, // البحث عن المستخدم المحيل
      });

      if (referrer) {
        // إضافة 500 نقطة للمستخدم المحيل
        await prisma.user.update({
          where: { telegramId: parseInt(referrerId) },
          data: {
            points: referrer.points + 500, // إضافة النقاط
          },
        });

        return NextResponse.json({
          message: `500 points have been added to the referrer with Telegram ID ${referrerId}`,
        });
      } else {
        return NextResponse.json({ message: 'Referrer not found' }, { status: 404 });
      }
    } else {
      return NextResponse.json({ message: 'No referrer found for this user' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}


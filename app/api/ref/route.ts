import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // تأكد من أن هذا هو المسار الصحيح لمكتبة Prisma

export async function GET(request: Request) {
  try {
    // الحصول على userId من الاستعلام باستخدام URLSearchParams
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'UserId is required' }, { status: 400 });
    }

    // البحث عن المستخدم باستخدام userId
    const user = await prisma.user.findUnique({
      where: { telegramId: parseInt(userId) }, // تحويل userId إلى عدد إذا كان عددًا
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // التحقق مما إذا كان للمستخدم محيل
    if (user.referrer === null) {
      return NextResponse.json({ message: 'User has no referrer, no points awarded' }, { status: 400 });
    }

    const referrerId = user.referrer;

    // البحث عن المحيل
    const referrer = await prisma.user.findUnique({
      where: { telegramId: referrerId }, // البحث عن المحيل
    });

    if (!referrer) {
      return NextResponse.json({ message: 'Referrer not found' }, { status: 404 });
    }

    // ✅ التأكد من أن النقاط لم تُمنح سابقًا لهذا المستخدم
    if (user.points === 0) {  
      // تحديث بيانات المحيل بإضافة 500 نقطة وزيادة `total_referral` بمقدار 1
      await prisma.user.update({
        where: { telegramId: referrerId },
        data: {
          points: { increment: 500 }, // إضافة النقاط
          total_referral: { increment: 1 }, // زيادة عدد الإحالات
        },
      });

      return NextResponse.json({
        message: `500 points have been added to referrer with Telegram ID ${referrerId}, and total_referral increased by 1.`,
      });
    } else {
      return NextResponse.json({ message: 'Points have already been awarded for this referral' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}

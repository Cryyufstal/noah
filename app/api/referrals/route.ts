// /app/api/referrals/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { userId, referrerId } = await req.json()

    if (!userId || !referrerId) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // تأكد من تحويل userId و referrerId إلى أرقام
    const userIdNumber = Number(userId)
    const referrerIdNumber = String(referrerId) // تحويل referrerId إلى string

    if (isNaN(userIdNumber)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    // تحديث بيانات الإحالة في قاعدة البيانات
    const user = await prisma.user.update({
      where: { telegramId: userIdNumber },
      data: {
        referrer: referrerIdNumber, // تخزين معرف المحيل كـ string
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error saving referral:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // تأكد من تحويل userId إلى رقم
    const userIdNumber = Number(userId)

    if (isNaN(userIdNumber)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: userIdNumber },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      referrals: user.referrals, // أو أي حقول أخرى متعلقة بالإحالات
      referrer: user.referrer, // المحيل
    })
  } catch (error) {
    console.error('Error fetching referrals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


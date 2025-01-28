import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const userData = await req.json();

        if (!userData || !userData.id) {
            return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
        }

        const { id, username, first_name, last_name, referrer } = userData;

        let user = await prisma.user.findUnique({
            where: { telegramId: id }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    telegramId: id,
                    username: username || '',
                    firstName: first_name || '',
                    lastName: last_name || '',
                    referrer: referrer || null // تخزين رابط الإحالة إذا كان موجودًا
                }
            });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error processing user data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

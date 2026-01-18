import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limitParam = parseInt(searchParams.get('limit') || '50', 10);
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(limitParam, 1), 100)
      : 50;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const trades = await prisma.trade.findMany({
      where: { userId: user.id },
      include: {
        market: {
          select: {
            id: true,
            title: true,
            isResolved: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Get outcome titles for each trade
    const tradesWithOutcomes = await Promise.all(
      trades.map(async (trade) => {
        const outcome = await prisma.outcome.findUnique({
          where: { id: trade.outcomeId },
          select: { title: true },
        });
        return {
          ...trade,
          outcomeTitle: outcome?.title || 'Unknown',
          totalCost: trade.shares * trade.price,
        };
      })
    );

    return NextResponse.json(tradesWithOutcomes);
  } catch (error) {
    console.error('Error fetching user trades:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching trades.' },
      { status: 500 }
    );
  }
}

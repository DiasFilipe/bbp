import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const positions = await prisma.position.findMany({
      where: { userId: user.id },
      include: {
        outcome: {
          include: {
            market: true,
          },
        },
      },
      orderBy: {
        outcome: {
          market: {
            createdAt: 'desc',
          },
        },
      },
    });

    // Calculate the value of each position
    const positionsWithValue = positions.map((position) => ({
      ...position,
      currentValue: position.shares * position.outcome.price,
      potentialPayout: position.outcome.market.isResolved
        ? position.outcome.market.resolvedOutcomeId === position.outcome.id
          ? position.shares
          : 0
        : position.shares, // Max potential if this outcome wins
    }));

    return NextResponse.json(positionsWithValue);
  } catch (error) {
    console.error('Error fetching user positions:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching positions.' },
      { status: 500 }
    );
  }
}

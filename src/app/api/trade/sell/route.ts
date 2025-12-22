import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

const PRICE_SENSITIVITY_FACTOR = 0.005; // Determines how much the price changes per share traded

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { outcomeId, shares } = body;

    if (!outcomeId || !shares || shares <= 0) {
      return NextResponse.json({ error: 'Invalid data provided.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user!.email! },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Fetch the user's position and the related outcome/market
      const position = await tx.position.findUnique({
        where: {
          userId_outcomeId: {
            userId: user.id,
            outcomeId: outcomeId,
          },
        },
        include: {
          outcome: {
            include: {
              market: true,
            },
          },
        },
      });

      // 2. Validation
      if (!position) {
        throw new Error('No position found for this outcome.');
      }
      if (position.shares < shares) {
        throw new Error('Insufficient shares to sell.');
      }
      if (position.outcome.market.isResolved) {
        throw new Error('Market is already resolved.');
      }

      const proceeds = shares * position.outcome.price;

      // 3. Increment user's balance
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { balance: { increment: proceeds } },
      });

      // 4. Create the trade record
      await tx.trade.create({
        data: {
          userId: user.id,
          marketId: position.outcome.marketId,
          outcomeId: outcomeId,
          type: 'SELL',
          shares: shares,
          price: position.outcome.price,
        },
      });

      // 5. Decrement the user's position
      await tx.position.update({
        where: { id: position.id },
        data: { shares: { decrement: shares } },
      });

      // 6. Update the outcome's price
      const newPrice = Math.max(0.01, position.outcome.price - (shares * PRICE_SENSITIVITY_FACTOR));
      await tx.outcome.update({
        where: { id: outcomeId },
        data: { price: newPrice, shares: { decrement: shares } },
      });

      return { updatedUser };
    });

    return NextResponse.json({
      message: 'Sale successful!',
      balance: result.updatedUser.balance,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing sale:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during the sale.' },
      { status: 500 }
    );
  }
}

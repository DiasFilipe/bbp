import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';

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

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Get user and outcome details within the transaction
      const user = await tx.user.findUnique({
        where: { email: session.user!.email! },
      });
      
      const outcome = await tx.outcome.findUnique({
        where: { id: outcomeId },
        include: { market: true },
      });

      if (!user) {
        // This should theoretically not happen if session exists
        throw new Error('User not found.');
      }
      if (!outcome) {
        throw new Error('Outcome not found.');
      }
      if (outcome.market.isResolved) {
        throw new Error('Market is already resolved.');
      }

      // 2. Check for sufficient funds (now atomically)
      const cost = shares * outcome.price;
      if (user.balance < cost) {
        throw new Error('Insufficient funds.');
      }

      // 3. Decrement user's balance
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: cost } },
      });

      // 4. Create the trade record
      await tx.trade.create({
        data: {
          userId: user.id,
          marketId: outcome.marketId,
          outcomeId: outcomeId,
          type: 'BUY',
          shares: shares,
          price: outcome.price,
        },
      });

      // 5. Update or create the user's position using upsert
      await tx.position.upsert({
        where: {
          userId_outcomeId: {
            userId: user.id,
            outcomeId: outcomeId,
          },
        },
        update: { shares: { increment: shares } },
        create: {
          userId: user.id,
          outcomeId: outcomeId,
          shares: shares,
        },
      });

      // 6. Update the outcome's price
      const newPrice = Math.min(0.99, outcome.price + (shares * PRICE_SENSITIVITY_FACTOR));
      await tx.outcome.update({
        where: { id: outcomeId },
        data: { price: newPrice, shares: { increment: shares } },
      });


      return { updatedUser };
    });

    return NextResponse.json({
      message: 'Purchase successful!',
      balance: result.updatedUser.balance,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing purchase:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during the purchase.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// This is a simplified implementation. A real-world scenario would require a more
// robust price calculation mechanism (e.g., a logarithmic market scoring rule).

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
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch the outcome and its market
      const outcome = await tx.outcome.findUnique({
        where: { id: outcomeId },
        include: { market: true },
      });

      if (!outcome) {
        throw new Error('Outcome not found.');
      }
      if (outcome.market.isResolved) {
        throw new Error('Market is already resolved.');
      }

      const cost = shares * outcome.price;

      // 2. Check if the user has enough balance
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

      // 5. Update or create the user's position
      const position = await tx.position.findUnique({
        where: {
          userId_outcomeId: {
            userId: user.id,
            outcomeId: outcomeId,
          },
        },
      });

      if (position) {
        await tx.position.update({
          where: { id: position.id },
          data: { shares: { increment: shares } },
        });
      } else {
        await tx.position.create({
          data: {
            userId: user.id,
            outcomeId: outcomeId,
            shares: shares,
          },
        });
      }

      // This is where a price update mechanism would go.
      // For now, the price remains fixed.

      return { updatedUser };
    });

    return NextResponse.json({
      message: 'Purchase successful!',
      balance: result.updatedUser.balance,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing purchase:', error);
    // Check for specific Prisma transaction errors if needed
    return NextResponse.json(
      { error: error.message || 'An error occurred during the purchase.' },
      { status: 500 }
    );
  }
}

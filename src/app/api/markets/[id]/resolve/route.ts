import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const marketId = params.id;
    const body = await request.json();
    const { winningOutcomeId } = body;

    if (!winningOutcomeId) {
      return NextResponse.json({ error: 'Winning outcome ID is required.' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch market and validate
      const market = await tx.market.findUnique({
        where: { id: marketId },
        include: { outcomes: true },
      });

      if (!market) {
        throw new Error('Market not found.');
      }
      if (market.isResolved) {
        throw new Error('Market is already resolved.');
      }
      const winningOutcome = market.outcomes.find(o => o.id === winningOutcomeId);
      if (!winningOutcome) {
        throw new Error('Winning outcome is not valid for this market.');
      }

      // 2. Mark the market as resolved
      const resolvedMarket = await tx.market.update({
        where: { id: marketId },
        data: {
          isResolved: true,
          resolvedOutcomeId: winningOutcomeId,
        },
      });

      // 3. Find all positions for the winning outcome
      const winningPositions = await tx.position.findMany({
        where: {
          outcomeId: winningOutcomeId,
        },
      });

      // 4. Distribute payouts
      // Each share of the winning outcome is worth 1 unit of currency.
      for (const position of winningPositions) {
        const payout = position.shares; // 1 share = 1 unit
        await tx.user.update({
          where: { id: position.userId },
          data: { balance: { increment: payout } },
        });
      }
      
      // Note: In a real system, you might want to create a "payout" record
      // or transaction history for auditing purposes.

      return { resolvedMarket };
    });

    return NextResponse.json(result.resolvedMarket, { status: 200 });

  } catch (error: any) {
    console.error(`Error resolving market ${params.id}:`, error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while resolving the market.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit';
import { RATE_LIMIT_MAX_SENSITIVE, RATE_LIMIT_WINDOW_MS } from '@/lib/constants';

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rate = checkRateLimit(
    getRateLimitKey(request, 'markets-resolve'),
    RATE_LIMIT_MAX_SENSITIVE,
    RATE_LIMIT_WINDOW_MS
  );
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many requests.' },
      {
        status: 429,
        headers: { 'Retry-After': Math.ceil((rate.resetAt - Date.now()) / 1000).toString() },
      }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: marketId } = await params;
    const body = await request.json();
    const { winningOutcomeId } = body;

    if (!winningOutcomeId || typeof winningOutcomeId !== 'string') {
      return NextResponse.json({ error: 'Winning outcome ID is required.' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Fetch market and validate
      const market = await tx.market.findUnique({
        where: { id: marketId },
        include: { outcomes: true },
      });

      if (!market) {
        throw new ApiError('Market not found.', 404);
      }
      if (market.isResolved) {
        throw new ApiError('Market is already resolved.', 409);
      }

      // Authorization Check: Ensure only the creator or an admin can resolve the market.
      const isCreator = market.creatorId === session.user!.id;
      const isAdmin = session.user!.isAdmin || false;

      if (!isCreator && !isAdmin) {
        throw new ApiError('Only the market creator or an admin can resolve this market.', 403);
      }

      const winningOutcome = market.outcomes.find(o => o.id === winningOutcomeId);
      if (!winningOutcome) {
        throw new ApiError('Winning outcome is not valid for this market.', 400);
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
    const { id } = await params;
    console.error(`Error resolving market ${id}:`, error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error.message || 'An error occurred while resolving the market.' },
      { status: 500 }
    );
  }
}

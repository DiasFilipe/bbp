import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import {
  TRANSACTION_FEE_RATE,
  PRICE_SENSITIVITY_FACTOR,
  MAX_PRICE,
  MIN_PRICE,
  LMSR_ENABLED,
  DEFAULT_LIQUIDITY_PARAMETER,
  PRICE_SUM_TOLERANCE,
  RATE_LIMIT_MAX_SENSITIVE,
  RATE_LIMIT_WINDOW_MS,
} from '@/lib/constants';
import { normalizePricesWithBounds, validatePriceSum, getPriceDeviation } from '@/lib/pricing/normalize';
import { calculateBuyCost, getUpdatedPrices } from '@/lib/pricing/lmsr';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit';

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function POST(request: Request) {
  const rate = checkRateLimit(
    getRateLimitKey(request, 'trade-buy'),
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
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { outcomeId, shares } = body;
    const sharesNumber = Number(shares);

    if (!outcomeId || !Number.isFinite(sharesNumber) || sharesNumber <= 0) {
      return NextResponse.json({ error: 'Invalid data provided.' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx: any) => {
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
        throw new ApiError('User not found.', 404);
      }
      if (!outcome) {
        throw new ApiError('Outcome not found.', 404);
      }
      if (outcome.market.isResolved) {
        throw new ApiError('Market is already resolved.', 409);
      }

      const allOutcomes = await tx.outcome.findMany({
        where: { marketId: outcome.marketId },
        orderBy: { createdAt: 'asc' },
      });

      const outcomeIndex = allOutcomes.findIndex((item) => item.id === outcomeId);
      if (outcomeIndex === -1) {
        throw new ApiError('Outcome not found in market.', 404);
      }

      const liquidityParameter = outcome.market.liquidityParameter || DEFAULT_LIQUIDITY_PARAMETER;

      // 2. Calculate cost with transaction fee
      const cost = LMSR_ENABLED
        ? calculateBuyCost(
            allOutcomes.map((item) => item.shares),
            outcomeIndex,
            sharesNumber,
            liquidityParameter
          )
        : sharesNumber * outcome.price;
      const fee = cost * TRANSACTION_FEE_RATE;
      const totalCost = cost + fee;

      if (user.balance < totalCost) {
        throw new ApiError('Insufficient funds.', 400);
      }

      // 3. Decrement user's balance (cost + fee)
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: totalCost } },
      });

      // 4. Create the trade record
      await tx.trade.create({
        data: {
          userId: user.id,
          marketId: outcome.marketId,
          outcomeId: outcomeId,
          type: 'BUY',
          shares: sharesNumber,
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
        update: { shares: { increment: sharesNumber } },
        create: {
          userId: user.id,
          outcomeId: outcomeId,
          shares: sharesNumber,
        },
      });

      // 6. Update the outcome's price with normalization (Phase 1) or LMSR
      let normalizedPrices: number[] = [];
      if (LMSR_ENABLED) {
        normalizedPrices = getUpdatedPrices(
          allOutcomes.map((item) => item.shares),
          outcomeIndex,
          sharesNumber,
          liquidityParameter
        );
      } else {
        const newPrice = Math.min(MAX_PRICE, outcome.price + (sharesNumber * PRICE_SENSITIVITY_FACTOR));
        const newPrices = allOutcomes.map(o =>
          o.id === outcomeId ? newPrice : o.price
        );
        normalizedPrices = normalizePricesWithBounds(newPrices, MIN_PRICE, MAX_PRICE);
      }

      if (!validatePriceSum(normalizedPrices, PRICE_SUM_TOLERANCE)) {
        throw new Error('Normalized prices are invalid.');
      }

      const deviation = getPriceDeviation(normalizedPrices);
      if (deviation > PRICE_SUM_TOLERANCE) {
        console.warn('Price sum deviation detected after BUY', {
          marketId: outcome.marketId,
          outcomeId,
          deviation,
        });
      }

      // Update all outcomes with normalized prices
      for (let i = 0; i < allOutcomes.length; i++) {
        await tx.outcome.update({
          where: { id: allOutcomes[i].id },
          data: {
            price: normalizedPrices[i],
            shares: allOutcomes[i].id === outcomeId
              ? { increment: sharesNumber }
              : undefined,
          },
        });
      }

      return { updatedUser, fee, totalCost };
    });

    return NextResponse.json({
      message: 'Purchase successful!',
      balance: result.updatedUser.balance,
      fee: result.fee,
      totalCost: result.totalCost,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing purchase:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error.message || 'An error occurred during the purchase.' },
      { status: 500 }
    );
  }
}

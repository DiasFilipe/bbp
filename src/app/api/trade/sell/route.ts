import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import {
  TRANSACTION_FEE_RATE,
  PRICE_SENSITIVITY_FACTOR,
  MIN_PRICE,
  MAX_PRICE,
  LMSR_ENABLED,
  DEFAULT_LIQUIDITY_PARAMETER,
  PRICE_SUM_TOLERANCE,
} from '@/lib/constants';
import { normalizePricesWithBounds, validatePriceSum, getPriceDeviation } from '@/lib/pricing/normalize';
import { calculateSellProceeds, getUpdatedPrices } from '@/lib/pricing/lmsr';

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function POST(request: Request) {
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
        throw new ApiError('No position found for this outcome.', 404);
      }
      if (position.shares < sharesNumber) {
        throw new ApiError('Insufficient shares to sell.', 400);
      }
      if (position.outcome.market.isResolved) {
        throw new ApiError('Market is already resolved.', 409);
      }

      const allOutcomes = await tx.outcome.findMany({
        where: { marketId: position.outcome.marketId },
        orderBy: { createdAt: 'asc' },
      });

      const outcomeIndex = allOutcomes.findIndex((item) => item.id === outcomeId);
      if (outcomeIndex === -1) {
        throw new ApiError('Outcome not found in market.', 404);
      }
      if (allOutcomes[outcomeIndex].shares < sharesNumber) {
        throw new ApiError('Market has insufficient shares for this outcome.', 409);
      }

      const liquidityParameter = position.outcome.market.liquidityParameter || DEFAULT_LIQUIDITY_PARAMETER;

      // 3. Calculate proceeds with transaction fee
      const proceeds = LMSR_ENABLED
        ? calculateSellProceeds(
            allOutcomes.map((item) => item.shares),
            outcomeIndex,
            sharesNumber,
            liquidityParameter
          )
        : sharesNumber * position.outcome.price;
      const fee = proceeds * TRANSACTION_FEE_RATE;
      const netProceeds = proceeds - fee;

      // 4. Increment user's balance (proceeds - fee)
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { balance: { increment: netProceeds } },
      });

      // 5. Create the trade record
      await tx.trade.create({
        data: {
          userId: user.id,
          marketId: position.outcome.marketId,
          outcomeId: outcomeId,
          type: 'SELL',
          shares: sharesNumber,
          price: position.outcome.price,
        },
      });

      // 6. Decrement the user's position
      await tx.position.update({
        where: { id: position.id },
        data: { shares: { decrement: sharesNumber } },
      });

      // 7. Update the outcome's price with normalization (Phase 1) or LMSR
      let normalizedPrices: number[] = [];
      if (LMSR_ENABLED) {
        normalizedPrices = getUpdatedPrices(
          allOutcomes.map((item) => item.shares),
          outcomeIndex,
          -sharesNumber,
          liquidityParameter
        );
      } else {
        const newPrice = Math.max(MIN_PRICE, position.outcome.price - (sharesNumber * PRICE_SENSITIVITY_FACTOR));
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
        console.warn('Price sum deviation detected after SELL', {
          marketId: position.outcome.marketId,
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
              ? { decrement: sharesNumber }
              : undefined,
          },
        });
      }

      return { updatedUser, fee, netProceeds };
    });

    return NextResponse.json({
      message: 'Sale successful!',
      balance: result.updatedUser.balance,
      fee: result.fee,
      netProceeds: result.netProceeds,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing sale:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error.message || 'An error occurred during the sale.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: marketId } = await params;

    if (!marketId) {
      return NextResponse.json({ error: 'Market ID is required.' }, { status: 400 });
    }

    const market = await prisma.market.findUnique({
      where: {
        id: marketId,
      },
      include: {
        outcomes: true, // Include the outcomes for the market
      },
    });

    if (!market) {
      return NextResponse.json({ error: 'Market not found.' }, { status: 404 });
    }

    // Calculate market statistics
    const trades = await prisma.trade.findMany({
      where: { marketId },
      select: {
        shares: true,
        price: true,
        userId: true,
      },
    });

    // Total volume traded (sum of shares * price for all trades)
    const totalVolume = trades.reduce((sum, trade) => sum + (trade.shares * trade.price), 0);

    // Number of unique traders
    const uniqueTraders = new Set(trades.map(t => t.userId)).size;

    // Total shares outstanding across all outcomes
    const totalShares = market.outcomes.reduce((sum, outcome) => sum + outcome.shares, 0);

    // Market capitalization (sum of outcome shares * current price)
    const marketCap = market.outcomes.reduce(
      (sum, outcome) => sum + (outcome.shares * outcome.price),
      0
    );

    // Number of trades
    const totalTrades = trades.length;

    return NextResponse.json({
      ...market,
      statistics: {
        totalVolume,
        uniqueTraders,
        totalShares,
        marketCap,
        totalTrades,
      },
    });
  } catch (error) {
    const { id } = await params;
    console.error(`Error fetching market ${id}:`, error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the market.' },
      { status: 500 }
    );
  }
}

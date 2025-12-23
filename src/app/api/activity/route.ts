import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch recent trades with related data
    const recentTrades = await prisma.trade.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        market: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
        outcome: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Format the response
    const formattedTrades = recentTrades.map((trade) => ({
      id: trade.id,
      type: trade.type,
      shares: trade.shares,
      price: trade.price,
      createdAt: trade.createdAt,
      user: {
        name: trade.user.name || 'Anônimo',
      },
      market: {
        id: trade.market.id,
        title: trade.market.title,
        category: trade.market.category,
      },
      outcome: {
        title: trade.outcome.title,
      },
    }));

    return NextResponse.json(formattedTrades);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const markets = await prisma.market.findMany({
      include: {
        outcomes: true, // Include the outcomes for each market
      },
      orderBy: {
        createdAt: 'desc', // Show newest markets first
      },
    });
    return NextResponse.json(markets);
  } catch (error) {
    console.error('Error fetching markets:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching markets.' },
      { status: 500 }
    );
  }
}

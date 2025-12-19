import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const marketId = params.id;

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

    return NextResponse.json(market);
  } catch (error) {
    console.error(`Error fetching market ${params.id}:`, error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the market.' },
      { status: 500 }
    );
  }
}

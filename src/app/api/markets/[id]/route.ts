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

    return NextResponse.json(market);
  } catch (error) {
    const { id } = await params;
    console.error(`Error fetching market ${id}:`, error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the market.' },
      { status: 500 }
    );
  }
}

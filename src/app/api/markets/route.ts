import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, category, resolveAt, outcomes } = body;

    if (!title || !description || !category || !resolveAt || !outcomes || outcomes.length < 2) {
      return NextResponse.json({ error: 'Invalid data provided.' }, { status: 400 });
    }

    const newMarket = await prisma.market.create({
      data: {
        title,
        description,
        category,
        resolveAt,
        outcomes: {
          create: outcomes.map((outcome: { title: string }) => ({
            title: outcome.title,
          })),
        },
      },
      include: {
        outcomes: true,
      },
    });

    return NextResponse.json(newMarket, { status: 201 });
  } catch (error) {
    console.error('Error creating market:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the market.' },
      { status: 500 }
    );
  }
}

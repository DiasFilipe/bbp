import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const orderBy = searchParams.get('orderBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    // Build orderBy clause
    let orderByClause: any = {};
    if (orderBy === 'createdAt' || orderBy === 'resolveAt') {
      orderByClause[orderBy] = order;
    } else {
      orderByClause.createdAt = 'desc';
    }

    const markets = await prisma.market.findMany({
      where,
      include: {
        outcomes: true,
      },
      orderBy: orderByClause,
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

  if (!session || !session.user) {
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
        creatorId: session.user.id, // Associate the market with the creator
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

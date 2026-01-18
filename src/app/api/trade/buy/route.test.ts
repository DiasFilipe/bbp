import { POST } from './route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// Mock the dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
  getServerSession: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ ...data, status: options?.status || 200 })),
  },
}));

const mockUser = { id: 'user-1', email: 'test@example.com', balance: 100 };
const mockOutcome = { id: 'outcome-1', marketId: 'market-1', price: 0.50, market: { isResolved: false } };
const mockOtherOutcome = { id: 'outcome-2', marketId: 'market-1', price: 0.50 };

describe('POST /api/trade/buy', () => {
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should return 401 Unauthorized if user is not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const request = new Request('http://localhost/api/trade/buy', { method: 'POST', body: JSON.stringify({}) });
    
    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(response.error).toBe('Unauthorized');
  });

  it('should return 400 for invalid data', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { email: mockUser.email } });
    const request = new Request('http://localhost/api/trade/buy', { method: 'POST', body: JSON.stringify({ outcomeId: 'outcome-1', shares: 0 }) });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(response.error).toBe('Invalid data provided.');
  });
  
  it('should return 400 if user has insufficient funds', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { email: mockUser.email } });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...mockUser, balance: 10 }); // User has 10

    const transactionMock = jest.fn().mockImplementation(async (callback) => {
      const tx = {
        user: { findUnique: jest.fn().mockResolvedValue({ ...mockUser, balance: 10 }) },
        outcome: {
          findUnique: jest.fn().mockResolvedValue(mockOutcome),
          findMany: jest.fn().mockResolvedValue([mockOutcome, mockOtherOutcome]),
        },
      };
      return await callback(tx);
    });
    (prisma.$transaction as jest.Mock).mockImplementation(transactionMock);
    
    const request = new Request('http://localhost/api/trade/buy', {
        method: 'POST',
        body: JSON.stringify({ outcomeId: 'outcome-1', shares: 50 }) // Cost is 25
    });

    const response = await POST(request);
    
    expect(response.status).toBe(400);
    expect(response.error).toBe('Insufficient funds.');
  });
  
  it('should process a successful purchase', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { email: mockUser.email } });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    
    // Define the mock transaction client in an accessible scope
    const mockTxClient = {
      outcome: {
        findUnique: jest.fn().mockResolvedValue(mockOutcome),
        findMany: jest.fn().mockResolvedValue([mockOutcome, mockOtherOutcome]),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue(mockUser),
        update: jest.fn().mockResolvedValue({ ...mockUser, balance: 74.5 }),
      },
      trade: {
        create: jest.fn(),
      },
      position: {
        upsert: jest.fn(),
      },
    };

    // In the mock implementation, use the externally defined mock client
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      return await callback(mockTxClient);
    });

    const request = new Request('http://localhost/api/trade/buy', {
      method: 'POST',
      body: JSON.stringify({ outcomeId: 'outcome-1', shares: 50 }), // Cost = 50 * 0.50 = 25
    });

    const response = await POST(request);
    
    expect(response.status).toBe(200);
    expect(response.message).toBe('Purchase successful!');
    expect(response.balance).toBe(74.5);

    // Now, assert on the externally defined mock client
    expect(mockTxClient.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { balance: { decrement: 25.5 } },
    });
    expect(mockTxClient.trade.create).toHaveBeenCalled();
    expect(mockTxClient.position.upsert).toHaveBeenCalled();
    expect(mockTxClient.outcome.update).toHaveBeenCalled();
  });
});

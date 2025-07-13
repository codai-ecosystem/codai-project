import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  calculatePortfolioPerformance,
  executeTrade,
  calculateRSI,
  calculateSMA,
  generateTradingSignal,
  getMarketSentiment
} from '../../../lib/trading-utils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get('portfolioId');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    if (portfolioId && action === 'performance') {
      // Get portfolio performance
      const performance = await calculatePortfolioPerformance(portfolioId);

      // Get recent performance history
      const history = await prisma.portfolioPerformance.findMany({
        where: { portfolioId },
        orderBy: { date: 'desc' },
        take: 30 // Last 30 days
      });

      return NextResponse.json({
        current: performance,
        history
      });
    }

    if (portfolioId && action === 'positions') {
      // Get portfolio positions
      const positions = await prisma.position.findMany({
        where: { portfolioId },
        include: {
          asset: true
        },
        orderBy: { marketValue: 'desc' }
      });

      return NextResponse.json({ positions });
    }

    if (portfolioId && action === 'trades') {
      // Get portfolio trade history
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      const trades = await prisma.trade.findMany({
        where: { portfolioId },
        include: {
          asset: true,
          order: {
            select: {
              type: true,
              clientOrderId: true
            }
          }
        },
        orderBy: { executedAt: 'desc' },
        take: limit,
        skip: offset
      });

      const totalCount = await prisma.trade.count({
        where: { portfolioId }
      });

      return NextResponse.json({
        trades,
        totalCount,
        hasMore: offset + limit < totalCount
      });
    }

    if (userId) {
      // Get user's portfolios
      const portfolios = await prisma.portfolio.findMany({
        where: { userId },
        include: {
          positions: {
            include: { asset: true }
          },
          _count: {
            select: {
              positions: true,
              trades: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Calculate current performance for each portfolio
      const portfoliosWithPerformance = await Promise.all(
        portfolios.map(async (portfolio) => {
          try {
            const performance = await calculatePortfolioPerformance(portfolio.id);
            return {
              ...portfolio,
              performance
            };
          } catch (error) {
            console.error(`Error calculating performance for portfolio ${portfolio.id}:`, error);
            return {
              ...portfolio,
              performance: {
                totalValue: portfolio.totalValue,
                totalCash: portfolio.totalCash,
                totalInvested: 0,
                totalPnL: 0,
                dayChange: 0,
                dayChangePercent: 0
              }
            };
          }
        })
      );

      return NextResponse.json({ portfolios: portfoliosWithPerformance });
    }

    return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });

  } catch (error) {
    console.error('Portfolios GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'create') {
      // Create new portfolio
      const { userId, name, description, type, initialCash } = data;

      if (!userId || !name) {
        return NextResponse.json({
          error: 'User ID and portfolio name are required'
        }, { status: 400 });
      }

      const portfolio = await prisma.portfolio.create({
        data: {
          userId,
          name,
          description,
          type: type || 'STANDARD',
          totalCash: initialCash || 10000,
          totalValue: initialCash || 10000
        }
      });

      return NextResponse.json({
        message: 'Portfolio created successfully',
        portfolio
      }, { status: 201 });
    }

    if (action === 'add-cash') {
      // Add cash to portfolio
      const { portfolioId, amount } = data;

      if (!portfolioId || !amount || amount <= 0) {
        return NextResponse.json({
          error: 'Portfolio ID and positive amount are required'
        }, { status: 400 });
      }

      const portfolio = await prisma.portfolio.update({
        where: { id: portfolioId },
        data: {
          totalCash: {
            increment: amount
          },
          totalValue: {
            increment: amount
          }
        }
      });

      return NextResponse.json({
        message: 'Cash added successfully',
        portfolio
      });
    }

    if (action === 'withdraw-cash') {
      // Withdraw cash from portfolio
      const { portfolioId, amount } = data;

      if (!portfolioId || !amount || amount <= 0) {
        return NextResponse.json({
          error: 'Portfolio ID and positive amount are required'
        }, { status: 400 });
      }

      const portfolio = await prisma.portfolio.findUnique({
        where: { id: portfolioId }
      });

      if (!portfolio) {
        return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
      }

      if (portfolio.totalCash < amount) {
        return NextResponse.json({
          error: 'Insufficient cash balance'
        }, { status: 400 });
      }

      const updatedPortfolio = await prisma.portfolio.update({
        where: { id: portfolioId },
        data: {
          totalCash: {
            decrement: amount
          },
          totalValue: {
            decrement: amount
          }
        }
      });

      return NextResponse.json({
        message: 'Cash withdrawn successfully',
        portfolio: updatedPortfolio
      });
    }

    if (action === 'calculate-performance') {
      // Force recalculate portfolio performance
      const { portfolioId } = data;

      if (!portfolioId) {
        return NextResponse.json({
          error: 'Portfolio ID is required'
        }, { status: 400 });
      }

      const performance = await calculatePortfolioPerformance(portfolioId);

      // Update portfolio with calculated values
      await prisma.portfolio.update({
        where: { id: portfolioId },
        data: {
          totalValue: performance.totalValue,
          totalInvested: performance.totalInvested,
          totalPnL: performance.totalPnL,
          dayChange: performance.dayChange,
          dayChangePercent: performance.dayChangePercent,
          updatedAt: new Date()
        }
      });

      // Save performance snapshot
      await prisma.portfolioPerformance.upsert({
        where: {
          portfolioId_date: {
            portfolioId,
            date: new Date(new Date().toDateString()) // Today's date without time
          }
        },
        update: {
          totalValue: performance.totalValue,
          totalCash: performance.totalCash,
          totalInvested: performance.totalInvested,
          dailyReturn: performance.dayChange,
          dailyReturnPercent: performance.dayChangePercent
        },
        create: {
          portfolioId,
          date: new Date(new Date().toDateString()),
          totalValue: performance.totalValue,
          totalCash: performance.totalCash,
          totalInvested: performance.totalInvested,
          dailyReturn: performance.dayChange,
          dailyReturnPercent: performance.dayChangePercent,
          totalReturn: performance.totalPnL,
          totalReturnPercent: performance.totalInvested > 0 ?
            (performance.totalPnL / performance.totalInvested) * 100 : 0
        }
      });

      return NextResponse.json({
        message: 'Portfolio performance calculated',
        performance
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

  } catch (error) {
    console.error('Portfolios POST error:', error);
    return NextResponse.json({ error: 'Failed to process portfolio request' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { portfolioId, action, ...updateData } = body;

    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio ID required for update' }, { status: 400 });
    }

    if (action === 'update-info') {
      // Update portfolio information
      const { name, description, type } = updateData;

      const updatedPortfolio = await prisma.portfolio.update({
        where: { id: portfolioId },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(type && { type }),
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        message: 'Portfolio updated successfully',
        portfolio: updatedPortfolio
      });
    }

    if (action === 'set-default') {
      // Set as default portfolio
      const { userId } = updateData;

      if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
      }

      // Remove default status from all user portfolios
      await prisma.portfolio.updateMany({
        where: { userId },
        data: { isDefault: false }
      });

      // Set this portfolio as default
      const updatedPortfolio = await prisma.portfolio.update({
        where: { id: portfolioId },
        data: { isDefault: true }
      });

      return NextResponse.json({
        message: 'Default portfolio updated',
        portfolio: updatedPortfolio
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

  } catch (error) {
    console.error('Portfolios PUT error:', error);
    return NextResponse.json({ error: 'Failed to update portfolio' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get('portfolioId');

    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio ID required for deletion' }, { status: 400 });
    }

    // Check if portfolio has open positions
    const positions = await prisma.position.findMany({
      where: { portfolioId }
    });

    if (positions.length > 0) {
      return NextResponse.json({
        error: 'Cannot delete portfolio with open positions. Close all positions first.'
      }, { status: 400 });
    }

    // Check if portfolio has pending orders
    const pendingOrders = await prisma.order.findMany({
      where: {
        portfolioId,
        status: 'PENDING'
      }
    });

    if (pendingOrders.length > 0) {
      return NextResponse.json({
        error: 'Cannot delete portfolio with pending orders. Cancel all orders first.'
      }, { status: 400 });
    }

    // Soft delete portfolio (mark as inactive)
    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Portfolio deleted successfully'
    });

  } catch (error) {
    console.error('Portfolios DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete portfolio' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { executeTrade } from '../../../lib/trading-utils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const userId = searchParams.get('userId');
    const portfolioId = searchParams.get('portfolioId');
    const status = searchParams.get('status');

    if (orderId) {
      // Get specific order
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          asset: true,
          trades: {
            orderBy: { executedAt: 'desc' }
          }
        }
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      return NextResponse.json({ order });
    }

    // Get orders with filters
    const where: any = {};
    if (userId) where.userId = userId;
    if (portfolioId) where.portfolioId = portfolioId;
    if (status) where.status = status;

    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const orders = await prisma.order.findMany({
      where,
      include: {
        asset: true,
        trades: {
          select: {
            id: true,
            quantity: true,
            price: true,
            amount: true,
            executedAt: true
          }
        }
      },
      orderBy: { placedAt: 'desc' },
      take: limit,
      skip: offset
    });

    const totalCount = await prisma.order.count({ where });

    return NextResponse.json({
      orders,
      totalCount,
      hasMore: offset + limit < totalCount
    });

  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'place') {
      // Place new order
      const {
        userId,
        portfolioId,
        assetId,
        type,
        side,
        quantity,
        price,
        stopPrice,
        trailingAmount,
        timeInForce,
        clientOrderId
      } = data;

      if (!userId || !assetId || !type || !side || !quantity) {
        return NextResponse.json({
          error: 'User ID, asset ID, order type, side, and quantity are required'
        }, { status: 400 });
      }

      // Validate asset exists
      const asset = await prisma.asset.findUnique({
        where: { id: assetId }
      });

      if (!asset) {
        return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
      }

      if (!asset.isTradable) {
        return NextResponse.json({ error: 'Asset is not tradable' }, { status: 400 });
      }

      // Validate portfolio if provided
      if (portfolioId) {
        const portfolio = await prisma.portfolio.findUnique({
          where: { id: portfolioId }
        });

        if (!portfolio || portfolio.userId !== userId) {
          return NextResponse.json({ error: 'Portfolio not found or access denied' }, { status: 404 });
        }

        if (!portfolio.isActive) {
          return NextResponse.json({ error: 'Portfolio is not active' }, { status: 400 });
        }
      }

      // Validate order parameters based on type
      if (['LIMIT', 'STOP_LIMIT'].includes(type) && !price) {
        return NextResponse.json({ error: 'Limit price required for limit orders' }, { status: 400 });
      }

      if (['STOP', 'STOP_LIMIT', 'TRAILING_STOP'].includes(type) && !stopPrice && !trailingAmount) {
        return NextResponse.json({ error: 'Stop price or trailing amount required for stop orders' }, { status: 400 });
      }

      // Check order size limits
      if (asset.minOrderSize && quantity < asset.minOrderSize) {
        return NextResponse.json({
          error: `Order size below minimum (${asset.minOrderSize})`
        }, { status: 400 });
      }

      if (asset.maxOrderSize && quantity > asset.maxOrderSize) {
        return NextResponse.json({
          error: `Order size above maximum (${asset.maxOrderSize})`
        }, { status: 400 });
      }

      // For market orders, get current price
      let orderPrice = price;
      if (type === 'MARKET') {
        const latestPrice = await prisma.price.findFirst({
          where: { assetId },
          orderBy: { timestamp: 'desc' }
        });

        if (latestPrice) {
          orderPrice = side === 'BUY' ? latestPrice.high : latestPrice.low; // Simulate market price
        } else {
          return NextResponse.json({ error: 'Unable to determine market price' }, { status: 400 });
        }
      }

      // Create order
      const order = await prisma.order.create({
        data: {
          userId,
          portfolioId,
          assetId,
          type,
          side,
          quantity,
          price: orderPrice,
          stopPrice,
          trailingAmount,
          timeInForce: timeInForce || 'DAY',
          clientOrderId,
          brokerOrderId: `XTR_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
        },
        include: {
          asset: true
        }
      });

      // For market orders, execute immediately
      if (type === 'MARKET' && orderPrice) {
        setTimeout(async () => {
          try {
            await executeTrade(order.id, orderPrice, quantity);
          } catch (error) {
            console.error('Market order execution error:', error);
            // Update order status to failed
            await prisma.order.update({
              where: { id: order.id },
              data: {
                status: 'REJECTED',
                reason: 'Execution failed'
              }
            });
          }
        }, 1000); // Simulate 1 second execution delay
      }

      return NextResponse.json({
        message: 'Order placed successfully',
        order
      }, { status: 201 });
    }

    if (action === 'execute') {
      // Manual order execution (for simulation/testing)
      const { orderId, executionPrice, executedQuantity } = data;

      if (!orderId || !executionPrice || !executedQuantity) {
        return NextResponse.json({
          error: 'Order ID, execution price, and executed quantity are required'
        }, { status: 400 });
      }

      const result = await executeTrade(orderId, executionPrice, executedQuantity);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        message: 'Order executed successfully',
        trade: result.trade
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

  } catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json({ error: 'Failed to process order request' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, action, ...updateData } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required for update' }, { status: 400 });
    }

    if (action === 'cancel') {
      // Cancel order
      const { reason } = updateData;

      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      if (!['PENDING', 'PARTIAL'].includes(order.status)) {
        return NextResponse.json({
          error: 'Only pending or partially filled orders can be cancelled'
        }, { status: 400 });
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          reason: reason || 'Cancelled by user',
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        message: 'Order cancelled successfully',
        order: updatedOrder
      });
    }

    if (action === 'modify') {
      // Modify order (only for pending orders)
      const { price, quantity, stopPrice } = updateData;

      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      if (order.status !== 'PENDING') {
        return NextResponse.json({
          error: 'Only pending orders can be modified'
        }, { status: 400 });
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          ...(price && { price }),
          ...(quantity && { quantity }),
          ...(stopPrice && { stopPrice }),
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        message: 'Order modified successfully',
        order: updatedOrder
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

  } catch (error) {
    console.error('Orders PUT error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required for deletion' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only allow deletion of cancelled or rejected orders
    if (!['CANCELLED', 'REJECTED'].includes(order.status)) {
      return NextResponse.json({
        error: 'Only cancelled or rejected orders can be deleted'
      }, { status: 400 });
    }

    // Soft delete (mark as deleted instead of actual deletion for audit trail)
    await prisma.order.update({
      where: { id: orderId },
      data: {
        reason: (order.reason || '') + ' [DELETED]',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Orders DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}

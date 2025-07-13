import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  calculateRSI,
  calculateSMA,
  calculateEMA,
  generateTradingSignal,
  getMarketSentiment
} from '../../../lib/trading-utils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');
    const symbol = searchParams.get('symbol');
    const type = searchParams.get('type');
    const exchange = searchParams.get('exchange');
    const search = searchParams.get('search');

    if (assetId) {
      // Get specific asset with full details
      const asset = await prisma.asset.findUnique({
        where: { id: assetId },
        include: {
          prices: {
            orderBy: { timestamp: 'desc' },
            take: 100 // Last 100 price points for analysis
          },
          technicalData: {
            where: {
              timestamp: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
              }
            },
            orderBy: { timestamp: 'desc' }
          },
          fundamentalData: {
            orderBy: { reportDate: 'desc' },
            take: 4 // Last 4 quarters/years
          },
          newsItems: {
            where: {
              publishedAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
              }
            },
            orderBy: { publishedAt: 'desc' },
            take: 10
          }
        }
      });

      if (!asset) {
        return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
      }

      // Calculate technical indicators if we have price data
      let technicalAnalysis = null;
      if (asset.prices.length > 0) {
        const prices = asset.prices.map(p => p.close).reverse(); // Oldest to newest

        const rsi = calculateRSI(prices);
        const sma20 = calculateSMA(prices, 20);
        const sma50 = calculateSMA(prices, 50);
        const ema12 = calculateEMA(prices, 12);
        const ema26 = calculateEMA(prices, 26);

        const currentPrice = asset.prices[0].close;
        const signal = generateTradingSignal(rsi, sma20, sma50, currentPrice);

        technicalAnalysis = {
          rsi,
          sma20,
          sma50,
          ema12,
          ema26,
          currentPrice,
          signal
        };
      }

      // Get market sentiment
      const sentiment = await getMarketSentiment(assetId);

      return NextResponse.json({
        asset,
        technicalAnalysis,
        sentiment
      });
    }

    if (symbol) {
      // Get asset by symbol
      const asset = await prisma.asset.findUnique({
        where: { symbol: symbol.toUpperCase() },
        include: {
          prices: {
            orderBy: { timestamp: 'desc' },
            take: 1 // Just the latest price
          }
        }
      });

      if (!asset) {
        return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
      }

      return NextResponse.json({ asset });
    }

    // Search/filter assets
    const where: any = {};
    if (type) where.type = type;
    if (exchange) where.exchange = exchange;
    if (search) {
      where.OR = [
        { symbol: { contains: search.toUpperCase() } },
        { name: { contains: search } }
      ];
    }

    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const assets = await prisma.asset.findMany({
      where: {
        ...where,
        isActive: true
      },
      include: {
        prices: {
          orderBy: { timestamp: 'desc' },
          take: 1 // Latest price only
        },
        _count: {
          select: {
            positions: true,
            orders: true,
            watchlistItems: true
          }
        }
      },
      orderBy: [
        { isTradable: 'desc' },
        { marketCap: 'desc' },
        { symbol: 'asc' }
      ],
      take: limit,
      skip: offset
    });

    const totalCount = await prisma.asset.count({
      where: {
        ...where,
        isActive: true
      }
    });

    return NextResponse.json({
      assets,
      totalCount,
      hasMore: offset + limit < totalCount
    });

  } catch (error) {
    console.error('Assets GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'create') {
      // Create new asset (admin only)
      const {
        symbol,
        name,
        type,
        exchange,
        currency,
        sector,
        industry,
        marketCap,
        description,
        website,
        logo,
        minOrderSize,
        maxOrderSize,
        tickSize
      } = data;

      if (!symbol || !name || !type || !exchange) {
        return NextResponse.json({
          error: 'Symbol, name, type, and exchange are required'
        }, { status: 400 });
      }

      // Check if asset already exists
      const existingAsset = await prisma.asset.findUnique({
        where: { symbol: symbol.toUpperCase() }
      });

      if (existingAsset) {
        return NextResponse.json({
          error: 'Asset with this symbol already exists'
        }, { status: 400 });
      }

      const asset = await prisma.asset.create({
        data: {
          symbol: symbol.toUpperCase(),
          name,
          type,
          exchange,
          currency: currency || 'USD',
          sector,
          industry,
          marketCap,
          description,
          website,
          logo,
          minOrderSize,
          maxOrderSize,
          tickSize
        }
      });

      return NextResponse.json({
        message: 'Asset created successfully',
        asset
      }, { status: 201 });
    }

    if (action === 'add-price') {
      // Add price data for asset
      const { assetId, prices } = data; // prices should be array of price objects

      if (!assetId || !prices || !Array.isArray(prices)) {
        return NextResponse.json({
          error: 'Asset ID and prices array are required'
        }, { status: 400 });
      }

      const asset = await prisma.asset.findUnique({
        where: { id: assetId }
      });

      if (!asset) {
        return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
      }

      // Validate and insert price data
      const validPrices = prices.filter(price =>
        price.timestamp &&
        price.open >= 0 &&
        price.high >= 0 &&
        price.low >= 0 &&
        price.close >= 0 &&
        price.volume >= 0
      );

      if (validPrices.length === 0) {
        return NextResponse.json({
          error: 'No valid price data provided'
        }, { status: 400 });
      }

      const priceRecords = await Promise.all(
        validPrices.map(price =>
          prisma.price.upsert({
            where: {
              assetId_timestamp_timeframe: {
                assetId,
                timestamp: new Date(price.timestamp),
                timeframe: price.timeframe || '1D'
              }
            },
            update: {
              open: price.open,
              high: price.high,
              low: price.low,
              close: price.close,
              volume: price.volume,
              adjustedClose: price.adjustedClose
            },
            create: {
              assetId,
              timestamp: new Date(price.timestamp),
              open: price.open,
              high: price.high,
              low: price.low,
              close: price.close,
              volume: price.volume,
              adjustedClose: price.adjustedClose,
              timeframe: price.timeframe || '1D',
              source: price.source || 'HISTORICAL'
            }
          })
        )
      );

      return NextResponse.json({
        message: 'Price data added successfully',
        recordsAdded: priceRecords.length
      });
    }

    if (action === 'calculate-technicals') {
      // Calculate and store technical indicators
      const { assetId, period } = data;

      if (!assetId) {
        return NextResponse.json({
          error: 'Asset ID is required'
        }, { status: 400 });
      }

      const days = period || 30;
      const prices = await prisma.price.findMany({
        where: {
          assetId,
          timestamp: {
            gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { timestamp: 'asc' }
      });

      if (prices.length < 20) {
        return NextResponse.json({
          error: 'Insufficient price data for technical analysis'
        }, { status: 400 });
      }

      const closePrices = prices.map(p => p.close);
      const timestamp = new Date();

      // Calculate indicators
      const rsi = calculateRSI(closePrices);
      const sma20 = calculateSMA(closePrices, 20);
      const sma50 = calculateSMA(closePrices, 50);
      const ema12 = calculateEMA(closePrices, 12);
      const ema26 = calculateEMA(closePrices, 26);

      const currentPrice = closePrices[closePrices.length - 1];
      const signal = generateTradingSignal(rsi, sma20, sma50, currentPrice);

      // Store technical indicators
      const indicators = await Promise.all([
        prisma.technicalIndicator.upsert({
          where: {
            assetId_name_timeframe_timestamp: {
              assetId,
              name: 'RSI',
              timeframe: '1D',
              timestamp
            }
          },
          update: {
            value: rsi,
            signal: rsi < 30 ? 'BUY' : rsi > 70 ? 'SELL' : 'NEUTRAL'
          },
          create: {
            assetId,
            name: 'RSI',
            timeframe: '1D',
            value: rsi,
            signal: rsi < 30 ? 'BUY' : rsi > 70 ? 'SELL' : 'NEUTRAL',
            timestamp,
            parameters: JSON.stringify({ period: 14 })
          }
        }),
        prisma.technicalIndicator.upsert({
          where: {
            assetId_name_timeframe_timestamp: {
              assetId,
              name: 'SMA_20',
              timeframe: '1D',
              timestamp
            }
          },
          update: {
            value: sma20,
            signal: currentPrice > sma20 ? 'BUY' : 'SELL'
          },
          create: {
            assetId,
            name: 'SMA_20',
            timeframe: '1D',
            value: sma20,
            signal: currentPrice > sma20 ? 'BUY' : 'SELL',
            timestamp,
            parameters: JSON.stringify({ period: 20 })
          }
        }),
        prisma.technicalIndicator.upsert({
          where: {
            assetId_name_timeframe_timestamp: {
              assetId,
              name: 'SIGNAL',
              timeframe: '1D',
              timestamp
            }
          },
          update: {
            value: signal.strength,
            signal: signal.signal
          },
          create: {
            assetId,
            name: 'SIGNAL',
            timeframe: '1D',
            value: signal.strength,
            signal: signal.signal,
            timestamp,
            parameters: JSON.stringify({ reasons: signal.reasons })
          }
        })
      ]);

      return NextResponse.json({
        message: 'Technical indicators calculated',
        indicators: {
          rsi,
          sma20,
          sma50,
          ema12,
          ema26,
          signal
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

  } catch (error) {
    console.error('Assets POST error:', error);
    return NextResponse.json({ error: 'Failed to process asset request' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId, action, ...updateData } = body;

    if (!assetId) {
      return NextResponse.json({ error: 'Asset ID required for update' }, { status: 400 });
    }

    if (action === 'update-info') {
      // Update asset information
      const allowedFields = [
        'name', 'description', 'website', 'logo', 'sector', 'industry',
        'marketCap', 'minOrderSize', 'maxOrderSize', 'tickSize'
      ];

      const updateFields: any = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updateFields[field] = updateData[field];
        }
      });

      if (Object.keys(updateFields).length === 0) {
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
      }

      const updatedAsset = await prisma.asset.update({
        where: { id: assetId },
        data: {
          ...updateFields,
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        message: 'Asset updated successfully',
        asset: updatedAsset
      });
    }

    if (action === 'toggle-tradable') {
      // Toggle asset tradable status
      const asset = await prisma.asset.findUnique({
        where: { id: assetId }
      });

      if (!asset) {
        return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
      }

      const updatedAsset = await prisma.asset.update({
        where: { id: assetId },
        data: {
          isTradable: !asset.isTradable,
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        message: `Asset ${updatedAsset.isTradable ? 'enabled' : 'disabled'} for trading`,
        asset: updatedAsset
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

  } catch (error) {
    console.error('Assets PUT error:', error);
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');

    if (!assetId) {
      return NextResponse.json({ error: 'Asset ID required for deletion' }, { status: 400 });
    }

    // Check if asset has any positions or orders
    const [positions, orders] = await Promise.all([
      prisma.position.findMany({ where: { assetId } }),
      prisma.order.findMany({ where: { assetId, status: { in: ['PENDING', 'PARTIAL'] } } })
    ]);

    if (positions.length > 0 || orders.length > 0) {
      return NextResponse.json({
        error: 'Cannot delete asset with existing positions or pending orders'
      }, { status: 400 });
    }

    // Soft delete asset (mark as inactive)
    await prisma.asset.update({
      where: { id: assetId },
      data: {
        isActive: false,
        isTradable: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Asset deleted successfully'
    });

  } catch (error) {
    console.error('Assets DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
}

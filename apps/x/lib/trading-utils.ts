/**
 * X Trading Platform Utilities
 * Comprehensive trading and investment platform utilities
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Calculate position metrics
 */
export function calculatePositionMetrics(
  quantity: number,
  averagePrice: number,
  currentPrice: number,
  type: 'LONG' | 'SHORT'
): {
  marketValue: number;
  unrealizedPnL: number;
  totalReturn: number;
  totalReturnPercent: number;
} {
  const marketValue = quantity * currentPrice;

  let unrealizedPnL: number;
  if (type === 'LONG') {
    unrealizedPnL = quantity * (currentPrice - averagePrice);
  } else {
    unrealizedPnL = quantity * (averagePrice - currentPrice);
  }

  const totalReturn = unrealizedPnL;
  const investmentValue = quantity * averagePrice;
  const totalReturnPercent = investmentValue > 0 ? (totalReturn / investmentValue) * 100 : 0;

  return {
    marketValue: Math.round(marketValue * 100) / 100,
    unrealizedPnL: Math.round(unrealizedPnL * 100) / 100,
    totalReturn: Math.round(totalReturn * 100) / 100,
    totalReturnPercent: Math.round(totalReturnPercent * 100) / 100
  };
}

/**
 * Calculate portfolio performance
 */
export async function calculatePortfolioPerformance(
  portfolioId: string
): Promise<{
  totalValue: number;
  totalCash: number;
  totalInvested: number;
  totalPnL: number;
  dayChange: number;
  dayChangePercent: number;
}> {
  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        positions: {
          include: { asset: true }
        }
      }
    });

    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    let totalValue = portfolio.totalCash;
    let totalInvested = 0;
    let totalPnL = 0;

    // Calculate from positions
    for (const position of portfolio.positions) {
      const positionMetrics = calculatePositionMetrics(
        position.quantity,
        position.averagePrice,
        position.currentPrice,
        position.type as 'LONG' | 'SHORT'
      );

      totalValue += positionMetrics.marketValue;
      totalInvested += position.quantity * position.averagePrice;
      totalPnL += positionMetrics.unrealizedPnL;
    }

    // Get previous day performance for day change calculation
    const previousPerformance = await prisma.portfolioPerformance.findFirst({
      where: {
        portfolioId,
        date: {
          lt: new Date()
        }
      },
      orderBy: { date: 'desc' }
    });

    const previousValue = previousPerformance?.totalValue || totalInvested;
    const dayChange = totalValue - previousValue;
    const dayChangePercent = previousValue > 0 ? (dayChange / previousValue) * 100 : 0;

    return {
      totalValue: Math.round(totalValue * 100) / 100,
      totalCash: Math.round(portfolio.totalCash * 100) / 100,
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalPnL: Math.round(totalPnL * 100) / 100,
      dayChange: Math.round(dayChange * 100) / 100,
      dayChangePercent: Math.round(dayChangePercent * 100) / 100
    };

  } catch (error) {
    console.error('Portfolio performance calculation error:', error);
    throw error;
  }
}

/**
 * Execute trade order
 */
export async function executeTrade(
  orderId: string,
  executionPrice: number,
  executedQuantity: number
): Promise<{
  success: boolean;
  trade?: any;
  error?: string;
}> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { asset: true }
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    if (order.status !== 'PENDING') {
      return { success: false, error: 'Order is not pending' };
    }

    // Calculate fees (0.1% commission)
    const amount = executedQuantity * executionPrice;
    const commission = amount * 0.001;
    const fees = amount * 0.0001; // Additional platform fees

    // Create trade record
    const trade = await prisma.trade.create({
      data: {
        userId: order.userId,
        portfolioId: order.portfolioId || '',
        orderId: order.id,
        assetId: order.assetId,
        type: order.side,
        quantity: executedQuantity,
        price: executionPrice,
        amount,
        commission,
        fees,
        executedAt: new Date()
      }
    });

    // Update order status
    const isFullyFilled = order.filledQuantity + executedQuantity >= order.quantity;
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: isFullyFilled ? 'FILLED' : 'PARTIAL',
        filledQuantity: order.filledQuantity + executedQuantity,
        averageFillPrice: ((order.averageFillPrice || 0) * order.filledQuantity + executionPrice * executedQuantity) / (order.filledQuantity + executedQuantity),
        updatedAt: new Date()
      }
    });

    // Update or create position
    if (order.portfolioId) {
      await updatePosition(order.portfolioId, order.assetId, order.side, executedQuantity, executionPrice);
    }

    return { success: true, trade };

  } catch (error) {
    console.error('Trade execution error:', error);
    return { success: false, error: 'Failed to execute trade' };
  }
}

/**
 * Update position after trade
 */
async function updatePosition(
  portfolioId: string,
  assetId: string,
  side: string,
  quantity: number,
  price: number
): Promise<void> {
  try {
    const existingPosition = await prisma.position.findUnique({
      where: {
        portfolioId_assetId: {
          portfolioId,
          assetId
        }
      }
    });

    if (existingPosition) {
      // Update existing position
      let newQuantity = existingPosition.quantity;
      let newAveragePrice = existingPosition.averagePrice;

      if (side === 'BUY') {
        const totalCost = existingPosition.quantity * existingPosition.averagePrice + quantity * price;
        newQuantity += quantity;
        newAveragePrice = totalCost / newQuantity;
      } else {
        newQuantity -= quantity;
      }

      if (newQuantity <= 0) {
        // Close position
        await prisma.position.delete({
          where: { id: existingPosition.id }
        });
      } else {
        // Update position
        await prisma.position.update({
          where: { id: existingPosition.id },
          data: {
            quantity: newQuantity,
            averagePrice: newAveragePrice,
            lastUpdated: new Date()
          }
        });
      }
    } else if (side === 'BUY') {
      // Create new position
      await prisma.position.create({
        data: {
          portfolioId,
          assetId,
          type: 'LONG',
          quantity,
          averagePrice: price,
          currentPrice: price,
          marketValue: quantity * price,
          unrealizedPnL: 0,
          totalReturn: 0,
          totalReturnPercent: 0,
          dayChange: 0,
          dayChangePercent: 0,
          openedAt: new Date()
        }
      });
    }

  } catch (error) {
    console.error('Position update error:', error);
    throw error;
  }
}

/**
 * Calculate technical indicators
 */
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50; // Default neutral value

  let gains = 0;
  let losses = 0;

  // Calculate initial average gain and loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Calculate RSI for remaining periods
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return Math.round(rsi * 100) / 100;
}

/**
 * Calculate Simple Moving Average
 */
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;

  const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
  return Math.round((sum / period) * 100) / 100;
}

/**
 * Calculate Exponential Moving Average
 */
export function calculateEMA(prices: number[], period: number): number {
  if (prices.length === 0) return 0;
  if (prices.length === 1) return prices[0];

  const multiplier = 2 / (period + 1);
  let ema = prices[0];

  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
  }

  return Math.round(ema * 100) / 100;
}

/**
 * Risk management: Calculate position size
 */
export function calculatePositionSize(
  accountBalance: number,
  riskPercentage: number,
  entryPrice: number,
  stopLoss: number
): {
  shares: number;
  riskAmount: number;
  positionValue: number;
} {
  const riskAmount = accountBalance * (riskPercentage / 100);
  const riskPerShare = Math.abs(entryPrice - stopLoss);

  let shares = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0;

  // Ensure minimum position size
  shares = Math.max(shares, 1);

  const positionValue = shares * entryPrice;

  return {
    shares,
    riskAmount: Math.round(riskAmount * 100) / 100,
    positionValue: Math.round(positionValue * 100) / 100
  };
}

/**
 * Generate trading signal based on technical indicators
 */
export function generateTradingSignal(
  rsi: number,
  sma20: number,
  sma50: number,
  currentPrice: number
): {
  signal: 'BUY' | 'SELL' | 'HOLD';
  strength: number; // 0-100
  reasons: string[];
} {
  const reasons: string[] = [];
  let bullishSignals = 0;
  let bearishSignals = 0;

  // RSI analysis
  if (rsi < 30) {
    bullishSignals += 2;
    reasons.push('RSI oversold (< 30)');
  } else if (rsi > 70) {
    bearishSignals += 2;
    reasons.push('RSI overbought (> 70)');
  }

  // Moving average analysis
  if (currentPrice > sma20 && sma20 > sma50) {
    bullishSignals += 2;
    reasons.push('Price above SMA20 > SMA50 (uptrend)');
  } else if (currentPrice < sma20 && sma20 < sma50) {
    bearishSignals += 2;
    reasons.push('Price below SMA20 < SMA50 (downtrend)');
  }

  // Golden cross / Death cross
  if (sma20 > sma50) {
    bullishSignals += 1;
    reasons.push('Golden cross pattern');
  } else if (sma20 < sma50) {
    bearishSignals += 1;
    reasons.push('Death cross pattern');
  }

  const totalSignals = bullishSignals + bearishSignals;
  let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let strength = 0;

  if (bullishSignals > bearishSignals) {
    signal = 'BUY';
    strength = Math.round((bullishSignals / Math.max(totalSignals, 1)) * 100);
  } else if (bearishSignals > bullishSignals) {
    signal = 'SELL';
    strength = Math.round((bearishSignals / Math.max(totalSignals, 1)) * 100);
  } else {
    strength = 50; // Neutral
    reasons.push('Mixed signals - no clear direction');
  }

  return { signal, strength, reasons };
}

/**
 * Portfolio rebalancing
 */
export async function rebalancePortfolio(
  portfolioId: string,
  targetAllocations: { [assetId: string]: number } // Percentage allocations
): Promise<{
  success: boolean;
  rebalanceOrders: any[];
  error?: string;
}> {
  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        positions: {
          include: { asset: true }
        }
      }
    });

    if (!portfolio) {
      return { success: false, rebalanceOrders: [], error: 'Portfolio not found' };
    }

    const totalValue = portfolio.totalValue;
    const rebalanceOrders: any[] = [];

    for (const [assetId, targetPercent] of Object.entries(targetAllocations)) {
      const targetValue = totalValue * (targetPercent / 100);
      const currentPosition = portfolio.positions.find(p => p.assetId === assetId);
      const currentValue = currentPosition?.marketValue || 0;

      const difference = targetValue - currentValue;
      const toleranceThreshold = totalValue * 0.05; // 5% tolerance

      if (Math.abs(difference) > toleranceThreshold) {
        const asset = currentPosition?.asset || await prisma.asset.findUnique({ where: { id: assetId } });

        if (asset) {
          const shares = Math.abs(Math.floor(difference / asset.id.length)); // Simplified calculation
          const orderSide = difference > 0 ? 'BUY' : 'SELL';

          rebalanceOrders.push({
            assetId,
            side: orderSide,
            quantity: shares,
            type: 'MARKET',
            reason: `Rebalance to ${targetPercent}% allocation`
          });
        }
      }
    }

    return { success: true, rebalanceOrders };

  } catch (error) {
    console.error('Portfolio rebalancing error:', error);
    return { success: false, rebalanceOrders: [], error: 'Rebalancing failed' };
  }
}

/**
 * Get market sentiment for asset
 */
export async function getMarketSentiment(assetId: string): Promise<{
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  score: number; // -100 to 100
  factors: string[];
}> {
  try {
    // Get recent news for sentiment analysis
    const recentNews = await prisma.newsItem.findMany({
      where: {
        assetId,
        publishedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: { publishedAt: 'desc' },
      take: 20
    });

    let sentimentScore = 0;
    const factors: string[] = [];

    // Analyze news sentiment
    const positiveNews = recentNews.filter(n => n.sentiment === 'POSITIVE').length;
    const negativeNews = recentNews.filter(n => n.sentiment === 'NEGATIVE').length;
    const totalNews = recentNews.length;

    if (totalNews > 0) {
      const newsScore = ((positiveNews - negativeNews) / totalNews) * 50;
      sentimentScore += newsScore;
      factors.push(`News sentiment: ${positiveNews} positive, ${negativeNews} negative`);
    }

    // Get recent technical indicators
    const recentTechnicals = await prisma.technicalIndicator.findMany({
      where: {
        assetId,
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    // Analyze technical signals
    const buySignals = recentTechnicals.filter(t => t.signal === 'BUY').length;
    const sellSignals = recentTechnicals.filter(t => t.signal === 'SELL').length;
    const totalSignals = buySignals + sellSignals;

    if (totalSignals > 0) {
      const technicalScore = ((buySignals - sellSignals) / totalSignals) * 30;
      sentimentScore += technicalScore;
      factors.push(`Technical signals: ${buySignals} buy, ${sellSignals} sell`);
    }

    // Determine overall sentiment
    let sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    if (sentimentScore > 20) {
      sentiment = 'BULLISH';
    } else if (sentimentScore < -20) {
      sentiment = 'BEARISH';
    } else {
      sentiment = 'NEUTRAL';
    }

    return {
      sentiment,
      score: Math.round(sentimentScore),
      factors
    };

  } catch (error) {
    console.error('Market sentiment analysis error:', error);
    return {
      sentiment: 'NEUTRAL',
      score: 0,
      factors: ['Unable to analyze sentiment']
    };
  }
}

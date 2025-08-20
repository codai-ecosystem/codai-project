/**
 * Inventory Management Services for StocAI MCP Server
 */

import { Decimal } from 'decimal.js';
import { differenceInDays } from 'date-fns';
import _ from 'lodash';
import { logger } from '../utils/logger.js';

/**
 * Product status enumeration
 */
export enum ProductStatus {
    ACTIVE = 'active',
    DISCONTINUED = 'discontinued',
    OUT_OF_STOCK = 'out_of_stock',
    LOW_STOCK = 'low_stock',
}

/**
 * Stock movement types
 */
export enum StockMovementType {
    INBOUND = 'inbound',
    OUTBOUND = 'outbound',
    ADJUSTMENT = 'adjustment',
    TRANSFER = 'transfer',
    RETURN = 'return',
    DAMAGED = 'damaged',
}

/**
 * Product interface
 */
export interface Product {
    id: string;
    sku: string;
    name: string;
    description?: string;
    category: string;
    brand?: string;
    unitPrice: Decimal;
    costPrice: Decimal;
    currency: string;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    status: ProductStatus;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Inventory item interface
 */
export interface InventoryItem {
    productId: string;
    warehouseId: string;
    quantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    reorderLevel: number;
    maxStockLevel: number;
    lastRestockDate?: Date;
    expirationDate?: Date;
    batchNumber?: string;
    location?: string;
}

/**
 * Stock movement interface
 */
export interface StockMovement {
    id: string;
    productId: string;
    warehouseId: string;
    type: StockMovementType;
    quantity: number;
    previousQuantity: number;
    newQuantity: number;
    reference?: string;
    notes?: string;
    createdAt: Date;
    createdBy: string;
}

/**
 * Inventory analysis result
 */
export interface InventoryAnalysis {
    type: string;
    productId?: string;
    warehouseId?: string;
    analysis: {
        totalValue: Decimal;
        turnoverRate?: number;
        daysOfSupply?: number;
        stockStatus: string;
        recommendations: string[];
    };
    metrics: Record<string, any>;
}

/**
 * Stock forecast result
 */
export interface StockForecast {
    productId: string;
    warehouseId: string;
    forecastPeriodDays: number;
    currentStock: number;
    predictedDemand: number;
    recommendedReorder: number;
    stockoutRisk: 'low' | 'medium' | 'high';
    suggestedActions: string[];
}

/**
 * Inventory Services Class
 */
export class InventoryServices {
    /**
     * Calculate inventory value
     */
    static calculateInventoryValue(
        items: Array<{ quantity: number; unitPrice: number; costPrice?: number }>,
        valueMethod: 'selling' | 'cost' = 'cost'
    ): InventoryAnalysis {
        let totalValue = new Decimal(0);
        let totalItems = 0;

        for (const item of items) {
            const price = valueMethod === 'selling' ? item.unitPrice : (item.costPrice || item.unitPrice);
            const itemValue = new Decimal(price).mul(item.quantity);
            totalValue = totalValue.plus(itemValue);
            totalItems += item.quantity;
        }

        const averageItemValue = totalItems > 0 ? totalValue.div(totalItems) : new Decimal(0);

        logger.info('Calculated inventory value', {
            totalValue: totalValue.toNumber(),
            totalItems,
            valueMethod,
            averageItemValue: averageItemValue.toNumber(),
        });

        return {
            type: 'inventory_value',
            analysis: {
                totalValue,
                stockStatus: totalItems > 0 ? 'in_stock' : 'no_stock',
                recommendations: [
                    totalItems === 0 ? 'No inventory items found' : `Total inventory value: ${totalValue.toFixed(2)}`,
                    `Average item value: ${averageItemValue.toFixed(2)}`,
                    `Total items: ${totalItems.toLocaleString()}`,
                ],
            },
            metrics: {
                totalValue: totalValue.toNumber(),
                totalItems,
                averageItemValue: averageItemValue.toNumber(),
                valueMethod,
            },
        };
    }

    /**
     * Calculate inventory turnover rate
     */
    static calculateTurnoverRate(
        costOfGoodsSold: number,
        averageInventoryValue: number,
        periodDays: number = 365
    ): InventoryAnalysis {
        const cogs = new Decimal(costOfGoodsSold);
        const avgInventory = new Decimal(averageInventoryValue);

        if (avgInventory.equals(0)) {
            throw new Error('Average inventory value cannot be zero');
        }

        const turnoverRate = cogs.div(avgInventory);
        const daysInPeriod = new Decimal(periodDays);
        const daysOfSupply = daysInPeriod.div(turnoverRate);

        const performance = turnoverRate.gte(6) ? 'Excellent' :
            turnoverRate.gte(4) ? 'Good' :
                turnoverRate.gte(2) ? 'Average' : 'Poor';

        const recommendations = [
            `Inventory turns over ${turnoverRate.toFixed(2)} times per year`,
            `Average days of supply: ${daysOfSupply.toFixed(0)} days`,
            `Performance rating: ${performance}`,
        ];

        if (turnoverRate.lt(2)) {
            recommendations.push('Consider reducing inventory levels or improving sales velocity');
        } else if (turnoverRate.gt(12)) {
            recommendations.push('High turnover rate - ensure adequate stock levels to prevent stockouts');
        }

        logger.info('Calculated turnover rate', {
            turnoverRate: turnoverRate.toNumber(),
            daysOfSupply: daysOfSupply.toNumber(),
            performance,
        });

        return {
            type: 'turnover_analysis',
            analysis: {
                totalValue: new Decimal(averageInventoryValue),
                turnoverRate: turnoverRate.toNumber(),
                daysOfSupply: daysOfSupply.toNumber(),
                stockStatus: performance.toLowerCase(),
                recommendations,
            },
            metrics: {
                costOfGoodsSold,
                averageInventoryValue,
                turnoverRate: turnoverRate.toNumber(),
                daysOfSupply: daysOfSupply.toNumber(),
                periodDays,
            },
        };
    }

    /**
     * Generate reorder recommendations
     */
    static generateReorderRecommendations(
        currentStock: number,
        reorderLevel: number,
        maxStockLevel: number,
        averageDailyUsage: number,
        leadTimeDays: number = 7
    ): StockForecast {
        const safetyStock = Math.ceil(averageDailyUsage * leadTimeDays * 0.5); // 50% safety buffer
        const economicOrderQuantity = Math.ceil(Math.sqrt(2 * averageDailyUsage * 365 * 100) / 2); // Simplified EOQ

        const recommendedReorder = Math.max(
            maxStockLevel - currentStock,
            economicOrderQuantity
        );

        const daysUntilStockout = averageDailyUsage > 0 ? Math.floor(currentStock / averageDailyUsage) : Infinity;

        const stockoutRisk: 'low' | 'medium' | 'high' =
            currentStock <= reorderLevel ? 'high' :
                daysUntilStockout <= leadTimeDays * 2 ? 'medium' : 'low';

        const suggestedActions = [];

        if (currentStock <= reorderLevel) {
            suggestedActions.push(`URGENT: Reorder immediately - stock below reorder level`);
        }

        if (currentStock <= safetyStock) {
            suggestedActions.push(`Critical: Stock below safety level`);
        }

        if (recommendedReorder > 0) {
            suggestedActions.push(`Recommended order quantity: ${recommendedReorder} units`);
        }

        suggestedActions.push(`Estimated days until stockout: ${daysUntilStockout === Infinity ? 'N/A' : daysUntilStockout} days`);

        logger.info('Generated reorder recommendations', {
            currentStock,
            recommendedReorder,
            stockoutRisk,
            daysUntilStockout,
        });

        return {
            productId: 'analysis',
            warehouseId: 'analysis',
            forecastPeriodDays: leadTimeDays,
            currentStock,
            predictedDemand: averageDailyUsage * leadTimeDays,
            recommendedReorder,
            stockoutRisk,
            suggestedActions,
        };
    }

    /**
     * Analyze ABC classification (Pareto analysis)
     */
    static analyzeABCClassification(
        products: Array<{ id: string; name: string; annualValue: number }>
    ): { classification: Record<string, 'A' | 'B' | 'C'>; summary: Record<'A' | 'B' | 'C', { count: number; percentage: number; valuePercentage: number }> } {
        if (products.length === 0) {
            return { classification: {}, summary: { A: { count: 0, percentage: 0, valuePercentage: 0 }, B: { count: 0, percentage: 0, valuePercentage: 0 }, C: { count: 0, percentage: 0, valuePercentage: 0 } } };
        }

        // Sort by annual value descending
        const sortedProducts = _.orderBy(products, ['annualValue'], ['desc']);
        const totalValue = _.sumBy(products, 'annualValue');
        const totalCount = products.length;

        let cumulativeValue = 0;
        const classification: Record<string, 'A' | 'B' | 'C'> = {};
        const counters = { A: 0, B: 0, C: 0 };
        const values = { A: 0, B: 0, C: 0 };

        for (let i = 0; i < sortedProducts.length; i++) {
            const product = sortedProducts[i];
            cumulativeValue += product.annualValue;
            const cumulativePercentage = (cumulativeValue / totalValue) * 100;

            let category: 'A' | 'B' | 'C';
            if (cumulativePercentage <= 80) {
                category = 'A';
            } else if (cumulativePercentage <= 95) {
                category = 'B';
            } else {
                category = 'C';
            }

            classification[product.id] = category;
            counters[category]++;
            values[category] += product.annualValue;
        }

        const summary = {
            A: {
                count: counters.A,
                percentage: (counters.A / totalCount) * 100,
                valuePercentage: (values.A / totalValue) * 100
            },
            B: {
                count: counters.B,
                percentage: (counters.B / totalCount) * 100,
                valuePercentage: (values.B / totalValue) * 100
            },
            C: {
                count: counters.C,
                percentage: (counters.C / totalCount) * 100,
                valuePercentage: (values.C / totalValue) * 100
            },
        };

        logger.info('Completed ABC analysis', {
            totalProducts: totalCount,
            totalValue,
            categoryA: counters.A,
            categoryB: counters.B,
            categoryC: counters.C,
        });

        return { classification, summary };
    }

    /**
     * Calculate stock aging analysis
     */
    static calculateStockAging(
        inventoryItems: Array<{ productId: string; quantity: number; lastRestockDate: Date; unitValue: number }>
    ): { agingAnalysis: Record<string, { days: number; quantity: number; value: number; category: string }>; summary: Record<string, { totalQuantity: number; totalValue: number; productCount: number }> } {
        const today = new Date();
        const agingAnalysis: Record<string, { days: number; quantity: number; value: number; category: string }> = {};
        const categorySummary: Record<string, { totalQuantity: number; totalValue: number; productCount: number }> = {
            '0-30': { totalQuantity: 0, totalValue: 0, productCount: 0 },
            '31-60': { totalQuantity: 0, totalValue: 0, productCount: 0 },
            '61-90': { totalQuantity: 0, totalValue: 0, productCount: 0 },
            '90+': { totalQuantity: 0, totalValue: 0, productCount: 0 },
        };

        for (const item of inventoryItems) {
            const daysOld = differenceInDays(today, item.lastRestockDate);
            const totalValue = item.quantity * item.unitValue;

            let category: string;
            if (daysOld <= 30) {
                category = '0-30';
            } else if (daysOld <= 60) {
                category = '31-60';
            } else if (daysOld <= 90) {
                category = '61-90';
            } else {
                category = '90+';
            }

            agingAnalysis[item.productId] = {
                days: daysOld,
                quantity: item.quantity,
                value: totalValue,
                category,
            };

            if (categorySummary[category]) {
                categorySummary[category].totalQuantity += item.quantity;
                categorySummary[category].totalValue += totalValue;
                categorySummary[category].productCount += 1;
            }
        }

        logger.info('Completed stock aging analysis', {
            totalProducts: inventoryItems.length,
            categories: Object.keys(categorySummary).map(cat => ({
                category: cat,
                products: categorySummary[cat]?.productCount || 0,
                value: categorySummary[cat]?.totalValue || 0,
            })),
        });

        return { agingAnalysis, summary: categorySummary };
    }

    /**
     * Validate SKU format
     */
    static validateSKU(sku: string): boolean {
        // Basic SKU validation - alphanumeric with hyphens, 3-20 characters
        const skuRegex = /^[A-Z0-9-]{3,20}$/i;
        return skuRegex.test(sku);
    }

    /**
     * Generate SKU
     */
    static generateSKU(category: string, brand?: string): string {
        const categoryCode = category.substring(0, 3).toUpperCase();
        const brandCode = brand ? brand.substring(0, 2).toUpperCase() : 'GN';
        const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();

        return `${categoryCode}-${brandCode}-${randomSuffix}`;
    }
}

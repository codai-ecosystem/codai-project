import { NextRequest, NextResponse } from 'next/server';
import { CNDBancAIService } from '../../../../services/cnd-bancai-simplified';

const bancaiService = new CNDBancAIService();

/**
 * Banking Regulatory Reporting API
 * Handles regulatory report generation and compliance documentation
 */

/**
 * GET /api/banking/reports - Get regulatory reports
 */
export async function GET(request: NextRequest) {
    try {
        await bancaiService.initialize();

        const url = new URL(request.url);
        const { searchParams } = url;
        const reportType = searchParams.get('reportType');
        const status = searchParams.get('status');

        // For demo purposes, return guidance on available report types
        const availableReportTypes = [
            'ctr', // Currency Transaction Reports
            'sar', // Suspicious Activity Reports  
            'bsa', // Bank Secrecy Act Reports
            'kyc_summary', // Know Your Customer Summary
            'quarterly_compliance' // Quarterly Compliance Reports
        ];

        return NextResponse.json({
            success: true,
            data: {
                availableReportTypes,
                message: 'Use POST to generate new reports',
                filters: {
                    reportType: reportType || 'none specified',
                    status: status || 'none specified'
                }
            }
        });

    } catch (error) {
        console.error('Error retrieving reports:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to retrieve reports',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

/**
 * POST /api/banking/reports - Generate regulatory report
 */
export async function POST(request: NextRequest) {
    try {
        await bancaiService.initialize();

        const body = await request.json();
        const { reportType, periodStart, periodEnd } = body;

        // Validate required fields
        if (!reportType || !periodStart || !periodEnd) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: reportType, periodStart, periodEnd'
            }, { status: 400 });
        }

        // Validate report type
        const validReportTypes = ['ctr', 'sar', 'bsa', 'kyc_summary', 'quarterly_compliance'];
        if (!validReportTypes.includes(reportType)) {
            return NextResponse.json({
                success: false,
                error: `Invalid report type. Must be one of: ${validReportTypes.join(', ')}`
            }, { status: 400 });
        }

        // Parse dates
        const startDate = new Date(periodStart);
        const endDate = new Date(periodEnd);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return NextResponse.json({
                success: false,
                error: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)'
            }, { status: 400 });
        }

        if (startDate >= endDate) {
            return NextResponse.json({
                success: false,
                error: 'Period start date must be before end date'
            }, { status: 400 });
        }

        // Generate regulatory report
        const report = await bancaiService.generateRegulatoryReport(reportType, {
            start: startDate,
            end: endDate
        });

        return NextResponse.json({
            success: true,
            data: report,
            message: `${reportType.toUpperCase()} report generated successfully`
        }, { status: 201 });

    } catch (error) {
        console.error('Error generating report:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to generate report',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

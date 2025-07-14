import { NextRequest, NextResponse } from 'next/server';
import { AgentVerificationService } from '../../../lib/verification-service';

const verificationService = new AgentVerificationService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, filePath, authorId } = body;

    if (!agentId || !filePath || !authorId) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, filePath, authorId' },
        { status: 400 }
      );
    }

    // Start verification process
    const result = await verificationService.verifyAgent(agentId, filePath, authorId);

    return NextResponse.json({
      success: true,
      verification: result,
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify agent' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID required' },
        { status: 400 }
      );
    }

    const history = await verificationService.getVerificationHistory(agentId);

    return NextResponse.json({
      agentId,
      history,
    });
  } catch (error) {
    console.error('Verification history error:', error);
    return NextResponse.json(
      { error: 'Failed to get verification history' },
      { status: 500 }
    );
  }
}

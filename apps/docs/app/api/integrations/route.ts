// Docs Integration API Routes
// Documentation platform integration endpoints

import { NextRequest, NextResponse } from 'next/server';
import DocsService from '../../../lib/docs-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'status') {
      const status = DocsService.getSystemStatus();
      return NextResponse.json({
        status,
        timestamp: new Date().toISOString()
      });
    }

    const documents = await DocsService.getDocuments();

    return NextResponse.json({
      documents,
      total: documents.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Docs API GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'createDocument':
        const document = await DocsService.createDocument(data);
        return NextResponse.json({
          success: true,
          document,
          timestamp: new Date().toISOString()
        });

      case 'search':
        const results = await DocsService.searchDocuments(data.query, data.filters);
        return NextResponse.json({
          success: true,
          results,
          query: data.query,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Docs API POST error:', error);
    return NextResponse.json({ error: 'Documentation operation failed' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, updates, author, message } = body;

    if (!documentId || !updates || !author || !message) {
      return NextResponse.json({
        error: 'Document ID, updates, author, and message required'
      }, { status: 400 });
    }

    const success = await DocsService.updateDocument(documentId, updates, author, message);

    return NextResponse.json({
      success,
      documentId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Docs API PUT error:', error);
    return NextResponse.json({ error: 'Document update failed' }, { status: 500 });
  }
}

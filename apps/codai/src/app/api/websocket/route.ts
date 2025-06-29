import { NextRequest } from 'next/server';

// Simple WebSocket status simulation for demo purposes
let connectionStatus = {
  connected: true,
  connectionId: `ws_${Date.now()}`,
  messagesReceived: 0,
  messagesSent: 0,
  lastActivity: new Date().toISOString()
};

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'status':
        return Response.json({
          ...connectionStatus,
          uptime: Math.floor((Date.now() - parseInt(connectionStatus.connectionId.split('_')[1])) / 1000)
        });

      case 'send':
        const message = url.searchParams.get('message');
        if (message) {
          connectionStatus.messagesSent++;
          connectionStatus.lastActivity = new Date().toISOString();

          // Simulate receiving a response
          setTimeout(() => {
            connectionStatus.messagesReceived++;
          }, 100);

          return Response.json({
            sent: true,
            message,
            messageId: `msg_${Date.now()}`,
            stats: {
              sent: connectionStatus.messagesSent,
              received: connectionStatus.messagesReceived
            }
          });
        }
        return Response.json({ error: 'Message required' }, { status: 400 });

      case 'disconnect':
        connectionStatus.connected = false;
        connectionStatus.lastActivity = new Date().toISOString();
        return Response.json({ disconnected: true });

      case 'connect':
        connectionStatus.connected = true;
        connectionStatus.connectionId = `ws_${Date.now()}`;
        connectionStatus.lastActivity = new Date().toISOString();
        return Response.json({ connected: true, connectionId: connectionStatus.connectionId });

      default:
        return Response.json({
          available_actions: ['status', 'send', 'connect', 'disconnect'],
          examples: {
            status: '/api/websocket?action=status',
            send: '/api/websocket?action=send&message=Hello',
            connect: '/api/websocket?action=connect',
            disconnect: '/api/websocket?action=disconnect'
          },
          current_status: connectionStatus
        });
    }
  } catch (error) {
    console.error('WebSocket API Error:', error);
    return Response.json(
      { error: 'WebSocket operation failed' },
      { status: 500 }
    );
  }
}

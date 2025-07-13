'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';

interface WebSocketStatus {
  connected: boolean;
  connectionId: string;
  uptime: number;
  messagesSent: number;
  messagesReceived: number;
  lastActivity: string;
}

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  type: 'sent' | 'received' | 'system';
}

export default function RealtimeTestPage() {
  const [wsStatus, setWsStatus] = useState<WebSocketStatus | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (content: string, type: 'sent' | 'received' | 'system') => {
    const message: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      type
    };
    setMessages(prev => [...prev, message]);
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/websocket?action=status');
      const data = await response.json();
      setWsStatus(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
      addMessage('Failed to fetch WebSocket status', 'system');
    }
  };

  const connectWebSocket = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/websocket?action=connect');
      const data = await response.json();
      if (data.connected) {
        addMessage(`Connected to WebSocket (ID: ${data.connectionId})`, 'system');
        await fetchStatus();
      }
    } catch (error) {
      console.error('Failed to connect:', error);
      addMessage('Failed to connect to WebSocket', 'system');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWebSocket = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/websocket?action=disconnect');
      const data = await response.json();
      if (data.disconnected) {
        addMessage('Disconnected from WebSocket', 'system');
        await fetchStatus();
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
      addMessage('Failed to disconnect from WebSocket', 'system');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    setIsLoading(true);
    const messageToSend = inputMessage;
    setInputMessage('');

    try {
      const response = await fetch(`/api/websocket?action=send&message=${encodeURIComponent(messageToSend)}`);
      const data = await response.json();

      if (data.sent) {
        addMessage(messageToSend, 'sent');
        addMessage(`Echo: ${messageToSend} (ID: ${data.messageId})`, 'received');
        await fetchStatus();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage('Failed to send message', 'system');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-refresh status
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsStatus?.connected && Math.random() > 0.8) {
        const randomMessages = [
          'System notification: New user joined',
          'Real-time update: AI model processed request',
          'Analytics: Performance metrics updated',
          'WebSocket: Heartbeat received'
        ];
        const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
        addMessage(randomMessage, 'received');
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [wsStatus]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Real-time WebSocket Test</h1>
        <p className="text-gray-600 mb-4">
          Test WebSocket functionality and real-time communication features
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* WebSocket Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              WebSocket Status
              <Badge variant={wsStatus?.connected ? 'default' : 'destructive'}>
                {wsStatus?.connected ? '🟢 Connected' : '🔴 Disconnected'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {wsStatus && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Connection ID:</span>
                  <span className="font-mono text-xs">{wsStatus.connectionId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span>{wsStatus.uptime}s</span>
                </div>
                <div className="flex justify-between">
                  <span>Messages Sent:</span>
                  <span>{wsStatus.messagesSent}</span>
                </div>
                <div className="flex justify-between">
                  <span>Messages Received:</span>
                  <span>{wsStatus.messagesReceived}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Activity:</span>
                  <span className="text-xs">{new Date(wsStatus.lastActivity).toLocaleTimeString()}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={connectWebSocket}
                disabled={isLoading || wsStatus?.connected}
                size="sm"
                className="flex-1"
              >
                Connect
              </Button>
              <Button
                onClick={disconnectWebSocket}
                disabled={isLoading || !wsStatus?.connected}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Chat */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Real-time Communication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages Display */}
            <div className="h-80 overflow-y-auto space-y-2 p-4 border rounded-lg bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <p>No messages yet. Send a message to start!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'sent' ? 'justify-end' :
                        message.type === 'system' ? 'justify-center' : 'justify-start'
                      }`}
                  >
                    <div
                      className={`max-w-[80%] p-2 rounded-lg text-sm ${message.type === 'sent'
                          ? 'bg-blue-500 text-white'
                          : message.type === 'system'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                            : 'bg-white border shadow-sm'
                        }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border shadow-sm p-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                      <span className="text-sm">Processing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={isLoading || !wsStatus?.connected}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim() || !wsStatus?.connected}
              >
                Send
              </Button>
            </div>

            <div className="text-xs text-gray-600">
              {wsStatus?.connected
                ? 'WebSocket connected - messages will be sent in real-time'
                : 'Connect to WebSocket to send messages'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Test Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => sendMessage()}
              disabled={!wsStatus?.connected || !inputMessage.trim()}
              className="w-full"
            >
              Send Test Message
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setInputMessage('Hello WebSocket!');
                setTimeout(() => sendMessage(), 100);
              }}
              disabled={!wsStatus?.connected}
              className="w-full"
            >
              Quick Hello
            </Button>
            <Button
              variant="outline"
              onClick={() => setMessages([])}
              className="w-full"
            >
              Clear Messages
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

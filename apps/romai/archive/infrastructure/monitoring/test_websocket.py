#!/usr/bin/env python3
"""
Test WebSocket Server Connection
Quick test to validate our WebSocket streaming server.
"""

import asyncio
import websockets
import json
import time

async def test_websocket_connection():
    """Test WebSocket server connection and streaming."""
    try:
        print("🔌 Connecting to WebSocket server...")
        
        async with websockets.connect('ws://localhost:8766') as websocket:
            print("✅ Connected successfully!")
            
            # Send subscription message
            subscription = {
                'type': 'subscribe',
                'streams': ['logs', 'metrics', 'performance', 'security']
            }
            await websocket.send(json.dumps(subscription))
            print("📤 Sent subscription request")
            
            # Listen for messages
            message_count = 0
            start_time = time.time()
            test_duration = 15  # seconds
            
            print(f"📡 Listening for messages for {test_duration} seconds...")
            
            while time.time() - start_time < test_duration:
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=2)
                    data = json.loads(message)
                    message_count += 1
                    
                    print(f"📨 Message {message_count}: {data.get('stream_type', data.get('type', 'unknown'))} from {data.get('service', 'unknown')}")
                    
                    if message_count % 5 == 0:
                        print(f"   📊 Received {message_count} messages so far...")
                    
                except asyncio.TimeoutError:
                    print("⏳ No message received in 2 seconds, continuing...")
                    continue
                except json.JSONDecodeError as e:
                    print(f"❌ JSON decode error: {e}")
                    continue
            
            print(f"\n📈 Test Results:")
            print(f"   Total messages: {message_count}")
            print(f"   Messages per second: {message_count / test_duration:.2f}")
            print(f"   Test duration: {test_duration}s")
            
            if message_count > 0:
                print("✅ WebSocket streaming test PASSED!")
            else:
                print("❌ WebSocket streaming test FAILED - no messages received")
            
    except ConnectionRefusedError:
        print("❌ Connection refused - WebSocket server may not be running")
    except Exception as e:
        print(f"❌ Test failed: {e}")

async def test_websocket_ping():
    """Test WebSocket ping/pong."""
    try:
        async with websockets.connect('ws://localhost:8766') as websocket:
            # Send ping
            ping_msg = {'type': 'ping', 'timestamp': time.time()}
            await websocket.send(json.dumps(ping_msg))
            
            # Wait for pong
            response = await asyncio.wait_for(websocket.recv(), timeout=5)
            data = json.loads(response)
            
            if data.get('type') == 'pong':
                print("🏓 Ping/Pong test PASSED!")
            else:
                print(f"❌ Unexpected response: {data}")
                
    except Exception as e:
        print(f"❌ Ping test failed: {e}")

async def main():
    """Main test function."""
    print("🚀 ROMAI WebSocket Server Test")
    print("=" * 40)
    
    # Test basic connection and ping
    await test_websocket_ping()
    
    print("\n" + "=" * 40)
    
    # Test streaming functionality
    await test_websocket_connection()
    
    print("\n✨ WebSocket testing complete!")

if __name__ == "__main__":
    asyncio.run(main())

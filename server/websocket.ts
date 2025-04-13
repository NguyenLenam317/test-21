import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { saveChatMessage, getChatHistory } from './storage';

interface ClientSession {
  ws: WebSocket;
  deviceId: string;
  sessionId: string;
  ipAddress: string;
  userId?: string;
}

/**
 * Create a WebSocket server for real-time updates
 * @param server - HTTP server instance
 * @returns WebSocket server instance
 */
export function createWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server });
  const activeSessions = new Map<string, ClientSession>();

  wss.on('connection', (ws: WebSocket, req: any) => {
    // Generate unique identifiers
    const deviceId = req.headers['sec-websocket-key'] || 
                    req.socket.remoteAddress || 
                    Date.now().toString();
    
    const sessionId = `${deviceId}-${Date.now()}`;
    const ipAddress = req.socket.remoteAddress || 'unknown';

    const session: ClientSession = { 
      ws, 
      deviceId,
      sessionId,
      ipAddress
    };
    
    activeSessions.set(sessionId, session);

    console.log('WebSocket client connected');

    // Send initialization message with session details
    ws.send(JSON.stringify({
      type: 'session_init',
      sessionId,
      deviceId,
      ipAddress
    }));

    // Send welcome message with device ID
    ws.send(JSON.stringify({
      type: 'connection',
      deviceId,
      message: 'Connected to Ecosense WebSocket Server'
    }));

    // Send chat history for this device
    getChatHistory(deviceId).then(history => {
      ws.send(JSON.stringify({
        type: 'history',
        messages: history
      }));
    });

    // Handle incoming messages
    ws.on('message', async (message: string) => {
      try {
        const parsed = JSON.parse(message);
        
        // Validate session
        if (!parsed.sessionId || !activeSessions.has(parsed.sessionId)) {
          return ws.close(1008, 'Invalid session');
        }
        
        // Handle chat messages
        if (parsed.type === 'chat') {
          const session = activeSessions.get(parsed.sessionId)!;
          
          // Only send back to the same device/session
          session.ws.send(JSON.stringify({
            ...parsed,
            sessionId: session.sessionId,
            timestamp: new Date().toISOString()
          }));

          // Save message to device-specific history
          await saveChatMessage(deviceId, parsed.content);
        } else {
          // Handle different message types
          switch (parsed.type) {
            case 'subscribe':
              handleSubscription(ws, parsed);
              break;
            default:
              console.log('Unknown message type:', parsed.type);
          }
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      activeSessions.delete(sessionId);
    });
  });

  return wss;
}

/**
 * Handle subscription requests
 * @param ws - WebSocket client
 * @param message - Subscription message
 */
function handleSubscription(ws: WebSocket, message: any) {
  const { channel } = message;
  console.log(`Client subscribed to ${channel}`);

  // Send confirmation
  ws.send(JSON.stringify({
    type: 'subscribed',
    channel
  }));
}

/**
 * Broadcast a message to all connected clients
 * @param wss - WebSocketServer
 * @param message - Message to broadcast
 */
export function broadcastMessage(wss: WebSocketServer, message: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}
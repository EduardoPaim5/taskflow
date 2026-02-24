import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { Notification, ProjectEvent } from '../types';

const WS_URL = 'http://localhost:8080/api/ws';

type NotificationCallback = (notification: Notification) => void;
type ProjectEventCallback = (event: ProjectEvent) => void;

class WebSocketService {
  private client: Client | null = null;
  private notificationCallback: NotificationCallback | null = null;
  private projectSubscriptions: Map<number, StompSubscription> = new Map();
  private projectCallbacks: Map<number, ProjectEventCallback> = new Map();
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string, onNotification: NotificationCallback): void {
    if (this.client?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.notificationCallback = onNotification;

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('[WebSocket]', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        console.log('[WebSocket] Connected');
        this.subscribeToNotifications();
        this.sendConnectMessage();
      },
      onDisconnect: () => {
        console.log('[WebSocket] Disconnected');
        this.isConnecting = false;
      },
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error:', frame.headers.message);
        this.isConnecting = false;
        this.handleReconnect(token, onNotification);
      },
      onWebSocketError: (event) => {
        console.error('[WebSocket] WebSocket error:', event);
        this.isConnecting = false;
      },
    });

    this.client.activate();
  }

  private handleReconnect(token: string, onNotification: NotificationCallback): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[WebSocket] Reconnecting... attempt ${this.reconnectAttempts}`);
      setTimeout(() => {
        this.connect(token, onNotification);
      }, 5000 * this.reconnectAttempts);
    }
  }

  private subscribeToNotifications(): void {
    if (!this.client?.connected) return;

    // Subscribe to user-specific notifications
    this.client.subscribe('/user/queue/notifications', (message: IMessage) => {
      const notification = this.parseNotification(message.body);
      if (notification && this.notificationCallback) {
        this.notificationCallback(notification);
      }
    });

    // Subscribe to connection confirmation
    this.client.subscribe('/user/queue/connected', (message: IMessage) => {
      console.log('[WebSocket] Connection confirmed:', message.body);
    });

    // Subscribe to project subscription confirmation
    this.client.subscribe('/user/queue/subscribed', (message: IMessage) => {
      console.log('[WebSocket] Project subscription confirmed:', message.body);
    });
  }

  private sendConnectMessage(): void {
    if (!this.client?.connected) return;
    
    this.client.publish({
      destination: '/app/connect',
      body: '',
    });
  }

  private parseNotification(body: string): Notification | null {
    try {
      const data = JSON.parse(body);
      return {
        id: crypto.randomUUID(),
        type: data.type,
        title: data.title,
        message: data.message,
        entityId: data.entityId,
        entityType: data.entityType,
        projectId: data.projectId,
        projectName: data.projectName,
        actorId: data.actorId,
        actorName: data.actorName,
        timestamp: data.timestamp || new Date().toISOString(),
        read: false,
      };
    } catch (error) {
      console.error('[WebSocket] Failed to parse notification:', error);
      return null;
    }
  }

  subscribeToProject(projectId: number, callback: ProjectEventCallback): void {
    if (!this.client?.connected) {
      console.warn('[WebSocket] Cannot subscribe to project - not connected');
      return;
    }

    // Avoid duplicate subscriptions
    if (this.projectSubscriptions.has(projectId)) {
      return;
    }

    // Subscribe to project topic
    const subscription = this.client.subscribe(
      `/topic/project/${projectId}`,
      (message: IMessage) => {
        try {
          const event: ProjectEvent = JSON.parse(message.body);
          const cb = this.projectCallbacks.get(projectId);
          if (cb) {
            cb(event);
          }
        } catch (error) {
          console.error('[WebSocket] Failed to parse project event:', error);
        }
      }
    );

    this.projectSubscriptions.set(projectId, subscription);
    this.projectCallbacks.set(projectId, callback);

    // Notify server of subscription
    this.client.publish({
      destination: '/app/subscribe/project',
      body: JSON.stringify(projectId),
    });
  }

  unsubscribeFromProject(projectId: number): void {
    const subscription = this.projectSubscriptions.get(projectId);
    if (subscription) {
      subscription.unsubscribe();
      this.projectSubscriptions.delete(projectId);
      this.projectCallbacks.delete(projectId);
    }
  }

  disconnect(): void {
    // Unsubscribe from all projects
    this.projectSubscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.projectSubscriptions.clear();
    this.projectCallbacks.clear();

    // Deactivate client
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }

    this.notificationCallback = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}

export const websocketService = new WebSocketService();

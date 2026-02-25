/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Notification, ProjectEvent } from '../types';
import { websocketService } from '../services/websocket.service';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { authService } from '../services/auth.service';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  subscribeToProject: (projectId: number, callback: (event: ProjectEvent) => void) => void;
  unsubscribeFromProject: (projectId: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const MAX_NOTIFICATIONS = 50;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const { info, success } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const handleNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      const updated = [notification, ...prev].slice(0, MAX_NOTIFICATIONS);
      return updated;
    });

    // Show toast for important notifications
    switch (notification.type) {
      case 'TASK_ASSIGNED':
        info(notification.title, notification.message);
        break;
      case 'BADGE_EARNED':
        success(notification.title, notification.message);
        break;
      case 'LEVEL_UP':
        success(notification.title, notification.message);
        break;
      case 'TASK_STATUS_CHANGED':
        info(notification.title, notification.message);
        break;
      case 'PROJECT_MEMBER_ADDED':
        info(notification.title, notification.message);
        break;
      default:
        break;
    }
  }, [info, success]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = authService.getAccessToken();
      if (token) {
        websocketService.connect(token, handleNotification);
        
        // Check connection status periodically
        const interval = setInterval(() => {
          setIsConnected(websocketService.isConnected());
        }, 2000);

        return () => {
          clearInterval(interval);
          websocketService.disconnect();
          setIsConnected(false);
        };
      }
    } else {
      websocketService.disconnect();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsConnected(false);
      setNotifications([]);
    }
  }, [isAuthenticated, user, handleNotification]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const subscribeToProject = useCallback((projectId: number, callback: (event: ProjectEvent) => void) => {
    websocketService.subscribeToProject(projectId, callback);
  }, []);

  const unsubscribeFromProject = useCallback((projectId: number) => {
    websocketService.unsubscribeFromProject(projectId);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        clearAll,
        subscribeToProject,
        unsubscribeFromProject,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

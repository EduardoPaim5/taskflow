import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Wifi, WifiOff } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import type { Notification, NotificationType } from '../../types';

const notificationIcons: Record<NotificationType, string> = {
  TASK_ASSIGNED: '📋',
  TASK_STATUS_CHANGED: '🔄',
  TASK_COMMENT_ADDED: '💬',
  BADGE_EARNED: '🏆',
  LEVEL_UP: '⬆️',
  PROJECT_MEMBER_ADDED: '👥',
  PROJECT_UPDATED: '📁',
};

const notificationColors: Record<NotificationType, string> = {
  TASK_ASSIGNED: 'rgba(79, 195, 247, 0.2)',
  TASK_STATUS_CHANGED: 'rgba(255, 183, 77, 0.2)',
  TASK_COMMENT_ADDED: 'rgba(129, 199, 132, 0.2)',
  BADGE_EARNED: 'rgba(255, 213, 79, 0.2)',
  LEVEL_UP: 'rgba(186, 104, 200, 0.2)',
  PROJECT_MEMBER_ADDED: 'rgba(100, 181, 246, 0.2)',
  PROJECT_UPDATED: 'rgba(149, 117, 205, 0.2)',
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'agora';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function NotificationItem({ 
  notification, 
  onMarkAsRead 
}: { 
  notification: Notification; 
  onMarkAsRead: (id: string) => void;
}) {
  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02] ${
        notification.read ? 'opacity-60' : ''
      }`}
      style={{
        background: notification.read 
          ? 'rgba(255, 255, 255, 0.3)' 
          : notificationColors[notification.type],
        border: notification.read 
          ? '1px solid rgba(255, 255, 255, 0.2)' 
          : '1px solid rgba(255, 255, 255, 0.4)',
      }}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">
          {notificationIcons[notification.type]}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm truncate" style={{ color: '#1a365d' }}>
              {notification.title}
            </p>
            <span className="text-xs flex-shrink-0" style={{ color: '#4a6fa5' }}>
              {formatTimeAgo(notification.timestamp)}
            </span>
          </div>
          <p className="text-sm mt-0.5 line-clamp-2" style={{ color: '#4a6fa5' }}>
            {notification.message}
          </p>
          {notification.projectName && (
            <span 
              className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs"
              style={{ 
                background: 'rgba(2, 136, 209, 0.1)', 
                color: '#0288D1' 
              }}
            >
              {notification.projectName}
            </span>
          )}
        </div>
        {!notification.read && (
          <div 
            className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
            style={{ background: 'linear-gradient(180deg, #4FC3F7 0%, #0288D1 100%)' }}
          />
        )}
      </div>
    </div>
  );
}

export function NotificationBell() {
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl transition-all hover:scale-105"
        style={{
          background: isOpen 
            ? 'linear-gradient(180deg, #4FC3F7 0%, #0288D1 100%)'
            : 'rgba(255, 255, 255, 0.6)',
          boxShadow: isOpen 
            ? '0 4px 15px rgba(2, 136, 209, 0.3)' 
            : '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Bell className="w-5 h-5" style={{ color: isOpen ? '#fff' : '#1a365d' }} />
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white rounded-full"
            style={{
              background: 'linear-gradient(180deg, #EF5350 0%, #D32F2F 100%)',
              boxShadow: '0 2px 6px rgba(211, 47, 47, 0.4)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Connection indicator */}
        <span 
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
          style={{
            background: isConnected 
              ? 'linear-gradient(180deg, #81C784 0%, #388E3C 100%)'
              : 'linear-gradient(180deg, #EF5350 0%, #D32F2F 100%)',
          }}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 12px 40px rgba(31, 38, 135, 0.2)',
            zIndex: 100,
          }}
        >
          {/* Header */}
          <div 
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.4)' }}
          >
            <div className="flex items-center gap-2">
              <h3 className="font-bold" style={{ color: '#1a365d' }}>
                Notificacoes
              </h3>
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck className="w-4 h-4" style={{ color: '#4a6fa5' }} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1.5 rounded-lg hover:bg-red-100/50 transition-colors"
                  title="Limpar todas"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              )}
            </div>
          </div>

          {/* Notifications list */}
          <div className="max-h-96 overflow-y-auto p-2 space-y-2">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: '#4a6fa5' }} />
                <p className="text-sm" style={{ color: '#4a6fa5' }}>
                  Nenhuma notificacao
                </p>
                <p className="text-xs mt-1 opacity-70" style={{ color: '#4a6fa5' }}>
                  As notificacoes aparecerao aqui
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))
            )}
          </div>

          {/* Footer with count */}
          {notifications.length > 0 && (
            <div 
              className="px-4 py-2 text-center"
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.4)' }}
            >
              <p className="text-xs" style={{ color: '#4a6fa5' }}>
                {notifications.length} notificacao{notifications.length !== 1 ? 'es' : ''} 
                {unreadCount > 0 && ` • ${unreadCount} nao lida${unreadCount !== 1 ? 's' : ''}`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

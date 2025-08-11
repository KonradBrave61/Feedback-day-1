import React, { useState, useEffect } from 'react';

let notificationInstance = null;
let stickyKeys = new Set();

export const showNotification = (message, type = 'info', options = {}) => {
  if (notificationInstance) {
    notificationInstance(message, type, options);
  }
};

export const showSessionExpiredNotification = () => {
  // High-priority, sticky, de-duplicated notification
  showNotification('Your session ended. Please sign in again.', 'warning', {
    sticky: true,
    key: 'session-expired',
    priority: 'high',
  });
};

const Notification = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    notificationInstance = (message, type, options = {}) => {
      const { sticky = false, key = null, duration = 4000, priority = 'normal' } = options;

      // Use provided key (for dedupe) or fall back to timestamp id
      const id = key || Date.now();

      // De-duplicate sticky notifications by key
      if (sticky && key) {
        if (stickyKeys.has(key)) {
          return; // already shown
        }
        stickyKeys.add(key);
      }

      const newNotification = { id, message, type, sticky, key };

      // Insert at top if high priority so it appears first
      setNotifications(prev => (priority === 'high' ? [newNotification, ...prev] : [...prev, newNotification]));

      // Auto remove if not sticky
      if (!sticky) {
        const timeout = setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }, duration);
        // No need to clear timeout on unmount for this simple use
      }
    };

    return () => {
      notificationInstance = null;
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    // If removing a sticky keyed notification, release its key so it can show again later if needed
    const toRemove = notifications.find(n => n.id === id);
    if (toRemove && toRemove.sticky && toRemove.key) {
      stickyKeys.delete(toRemove.key);
    }
  };

  const getNotificationStyle = (type) => {
    const baseStyle = "px-6 py-4 mb-3 rounded-lg shadow-lg border-l-4 text-white font-medium flex items-center justify-between";
    
    switch (type) {
      case 'success':
        return `${baseStyle} bg-green-600 border-green-400`;
      case 'error':
        return `${baseStyle} bg-red-600 border-red-400`;
      case 'warning':
        return `${baseStyle} bg-yellow-600 border-yellow-400`;
      default:
        return `${baseStyle} bg-blue-600 border-blue-400`;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-80">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={getNotificationStyle(notification.type)}
        >
          <div className="flex items-center">
            <span className="mr-3 text-lg">{getIcon(notification.type)}</span>
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-4 text-white hover:text-gray-200 text-xl font-bold"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notification;
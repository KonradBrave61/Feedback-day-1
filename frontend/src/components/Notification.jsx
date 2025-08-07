import React, { useState, useEffect } from 'react';

let notificationInstance = null;

export const showNotification = (message, type = 'info') => {
  if (notificationInstance) {
    notificationInstance(message, type);
  }
};

const Notification = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    notificationInstance = (message, type) => {
      const id = Date.now();
      const newNotification = { id, message, type };
      
      setNotifications(prev => [...prev, newNotification]);
      
      // Auto remove after 4 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 4000);
    };

    return () => {
      notificationInstance = null;
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
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
    <div className="fixed top-4 right-4 z-50 w-80">
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
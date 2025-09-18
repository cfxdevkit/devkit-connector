import { useNotifications } from '@conflux-devkit/ui-primitives';

export function NotificationContainer() {
  const { notifications, remove } = useNotifications();

  return (
    <div className="notification-container">
      {notifications.map((notification: any) => (
        <div
          key={notification.id}
          className={`notification ${notification.type || 'info'}`}
          onClick={() => {
            // Mark as read by removing it
            (remove as any)(notification.id);
          }}
        >
          <div className="notification-content">
            <div className="notification-header">
              <span className="notification-title">
                {notification.title || 'Notification'}
              </span>
              <button
                className="notification-close"
                onClick={(e) => {
                  e.stopPropagation();
                  (remove as any)(notification.id);
                }}
              >
                ×
              </button>
            </div>
            <div className="notification-message">
              {notification.message || 'No message'}
            </div>
            {notification.timestamp && (
              <div className="notification-timestamp">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Notification styles
const notificationStyles = `
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
  pointer-events: none;
}

.notification {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid #3b82f6;
  animation: slideIn 0.3s ease-out;
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.2s;
}

.notification:hover {
  transform: translateX(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.notification.success {
  border-left-color: #10b981;
}

.notification.error {
  border-left-color: #ef4444;
}

.notification.warning {
  border-left-color: #f59e0b;
}

.notification.info {
  border-left-color: #3b82f6;
}

.notification-content {
  position: relative;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.notification-title {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.875rem;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.notification-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.notification-message {
  color: #4a5568;
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.notification-timestamp {
  color: #9ca3af;
  font-size: 0.75rem;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = notificationStyles;
  document.head.appendChild(styleSheet);
}

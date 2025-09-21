# Web Push Notifications - MELLOWISE-015

## Overview

Complete Web Push Notification system for Mellowise that provides:
- Real-time push notifications across all devices
- Rich notification content with actions and images
- VAPID-compliant security and delivery
- Comprehensive analytics and tracking
- Intelligent scheduling and user preference management

## Architecture

### Components

1. **Service Worker** (`/public/sw.js`)
   - Handles push events and notification display
   - Manages notification interactions and analytics
   - Provides offline functionality and background sync

2. **Client Hook** (`/src/hooks/usePushNotifications.ts`)
   - Manages subscription lifecycle
   - Handles permission requests
   - Provides browser compatibility checks

3. **Push Service** (`/src/lib/notifications/push-service.ts`)
   - Server-side push notification delivery
   - VAPID key management
   - Subscription and analytics storage

4. **API Endpoints** (`/src/app/api/notifications/push/`)
   - Subscription management
   - Test notifications
   - Analytics collection

## Features

### Rich Notifications

```typescript
// Study Reminder Example
{
  title: "📚 Study Time!",
  message: "Ready to boost your learning? Let's practice some questions!",
  actions: [
    { action: 'start_practice', title: '🚀 Start Practice' },
    { action: 'snooze', title: '⏰ Remind me in 1 hour' }
  ],
  icon: '/static/icons/icon-192x192.png',
  badge: '/static/icons/badge-72x72.png'
}
```

### Notification Types

- **Study Reminders** - Time-based practice reminders
- **Goal Deadlines** - Urgent deadline notifications
- **Streak Maintenance** - Streak preservation alerts
- **Achievements** - Celebration notifications
- **Break Reminders** - Burnout prevention
- **Performance Alerts** - Progress insights

### Smart Features

- **Adaptive Timing** - Sends at optimal user study times
- **Quiet Hours** - Respects user sleep/work schedules
- **Device Management** - Multi-device subscription handling
- **Fallback Handling** - Graceful degradation for unsupported browsers

## Setup

### 1. Environment Variables

```bash
# Generate VAPID keys (run once)
npx web-push generate-vapid-keys

# Add to .env.local
VAPID_EMAIL=mailto:notifications@yourdomain.com
VAPID_PUBLIC_KEY=your_generated_public_key
VAPID_PRIVATE_KEY=your_generated_private_key
```

### 2. Database Tables

Required tables (auto-created by migrations):

```sql
-- Push subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used TIMESTAMP DEFAULT NOW()
);

-- Push analytics
CREATE TABLE push_analytics (
  id UUID PRIMARY KEY,
  notification_id UUID,
  subscription_id UUID,
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  type TEXT NOT NULL,
  priority TEXT NOT NULL,
  sent_at TIMESTAMP NOT NULL,
  delivery_result JSONB,
  device_info JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Client Integration

```typescript
import { usePushNotifications } from '@/hooks/usePushNotifications';

function NotificationSettings() {
  const {
    status,
    subscribe,
    unsubscribe,
    testNotification
  } = usePushNotifications();

  return (
    <div>
      {status.supported ? (
        <>
          {status.permission === 'granted' ? (
            status.subscribed ? (
              <button onClick={unsubscribe}>
                🔕 Disable Notifications
              </button>
            ) : (
              <button onClick={subscribe}>
                🔔 Enable Notifications
              </button>
            )
          ) : (
            <button onClick={requestPermission}>
              📢 Allow Notifications
            </button>
          )}
          <button onClick={() => testNotification()}>
            🧪 Test Notification
          </button>
        </>
      ) : (
        <p>Push notifications not supported in this browser</p>
      )}
    </div>
  );
}
```

### 4. Server Usage

```typescript
import PushService from '@/lib/notifications/push-service';

const pushService = new PushService();

// Send to specific user
await pushService.sendToUser(userId, {
  title: "New Achievement! 🎉",
  message: "You've mastered Logic Games fundamentals!",
  type: 'achievement',
  priority: 'medium',
  data: { achievementId: 'logic-games-master' }
});

// Send from notification object
await pushService.sendFromNotification(notification);

// Test notification
await pushService.sendTestNotification(userId);
```

## Browser Support

| Browser | Support Level | Notes |
|---------|---------------|-------|
| Chrome | ✅ Full | All features supported |
| Firefox | ✅ Full | All features supported |
| Safari | ⚠️ Limited | No action buttons, basic notifications only |
| Edge | ✅ Full | Chromium-based, full support |
| Mobile Chrome | ✅ Full | Add to homescreen for best experience |
| Mobile Safari | ❌ None | iOS Safari doesn't support web push |

## Security

### VAPID Keys
- Application server identification
- Message authentication
- Anti-spam protection

### Encryption
- Payload encryption using Web Push Protocol
- Automatic key rotation support
- Secure subscription storage

### Privacy
- User consent required for all notifications
- Granular permission controls
- Subscription data isolation per tenant

## Analytics

### Tracked Metrics
- **Delivery Rate** - Successfully sent notifications
- **Open Rate** - User interaction with notifications
- **Click Rate** - Action button usage
- **Conversion Rate** - Study sessions triggered by notifications

### Available Reports
- Permission grant/deny rates by browser
- Notification engagement by type and time
- Device subscription trends
- Delivery failure analysis

## Testing

### Manual Testing
```bash
# Test permission request
curl -X POST http://localhost:3000/api/notifications/analytics/permission \
  -H "Content-Type: application/json" \
  -d '{"permission": "granted", "userAgent": "test"}'

# Test notification
curl -X POST http://localhost:3000/api/notifications/push/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Test from API"}'
```

### Automated Testing
- Service worker functionality tests
- Push delivery simulation
- Browser compatibility checks
- Analytics data validation

## Performance

### Optimization
- Notification grouping to prevent spam
- Automatic subscription cleanup
- Efficient payload compression
- Smart retry logic for failed deliveries

### Monitoring
- Delivery latency tracking
- Subscription health monitoring
- Error rate alerting
- Resource usage optimization

## Troubleshooting

### Common Issues

1. **No VAPID Keys**
   ```
   Error: VAPID keys not configured
   Solution: Generate and set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY
   ```

2. **Permission Denied**
   ```
   Error: Permission denied for notifications
   Solution: User must manually grant permission
   ```

3. **Service Worker Not Registered**
   ```
   Error: Service worker not found
   Solution: Ensure /public/sw.js is accessible
   ```

4. **Invalid Subscription**
   ```
   Error: 410 Gone from push service
   Solution: Subscription expired, re-subscribe user
   ```

### Debug Mode
Enable debug logging:
```javascript
// In service worker
console.log('[SW] Debug mode enabled');
```

## Migration Guide

### From Other Push Services
1. Export existing subscriptions
2. Map to new schema format
3. Re-subscribe users gradually
4. Maintain parallel delivery during transition

### Database Updates
```sql
-- Add new columns if migrating from v1
ALTER TABLE push_subscriptions
ADD COLUMN user_agent TEXT,
ADD COLUMN last_used TIMESTAMP DEFAULT NOW();
```

## Best Practices

### User Experience
- Request permission contextually
- Provide clear value proposition
- Allow granular control over notification types
- Respect quiet hours and user preferences

### Development
- Test across multiple browsers
- Handle subscription failures gracefully
- Implement progressive enhancement
- Monitor delivery rates and adjust accordingly

### Security
- Rotate VAPID keys periodically
- Validate all subscription data
- Sanitize notification content
- Implement rate limiting

## Future Enhancements

### Planned Features
- **Rich Media Support** - Images and videos in notifications
- **Scheduled Notifications** - Advanced scheduling with timezone support
- **A/B Testing** - Notification content optimization
- **Machine Learning** - Optimal timing prediction

### Integration Opportunities
- **Calendar Integration** - Study schedule synchronization
- **Weather API** - Context-aware reminders
- **Social Features** - Study buddy notifications
- **Gamification** - Achievement and leaderboard updates

## Support

For issues or questions:
1. Check browser console for errors
2. Verify environment configuration
3. Test with simple notification first
4. Review analytics for delivery status

## Resources

- [Web Push API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker Guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [VAPID Specification](https://tools.ietf.org/html/rfc8292)
- [Web Push Protocol](https://tools.ietf.org/html/rfc8030)
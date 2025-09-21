# Twilio SMS Integration Setup
## MELLOWISE-015: Smart Notification System

### Required Environment Variables

Add these to your `.env.local` file:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_MESSAGING_SERVICE_SID=your_messaging_service_sid_here  # Optional but recommended

# Optional: SendGrid for email (recommended)
SENDGRID_API_KEY=your_sendgrid_api_key_here

# Optional: OneSignal for push notifications
ONESIGNAL_APP_ID=your_onesignal_app_id_here
ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key_here
```

### Twilio Setup Instructions

1. **Create Twilio Account**
   - Go to [twilio.com](https://twilio.com)
   - Sign up for a free trial (includes $15 credit)
   - Verify your phone number

2. **Get Account Credentials**
   - Dashboard → Account → Account SID & Auth Token
   - Copy `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`

3. **Purchase Phone Number**
   - Phone Numbers → Manage → Buy a number
   - Choose a number with SMS capabilities
   - Copy the number to `TWILIO_PHONE_NUMBER`

4. **Set Up Messaging Service (Recommended)**
   - Messaging → Services → Create Messaging Service
   - Add your phone number to the service
   - Copy Service SID to `TWILIO_MESSAGING_SERVICE_SID`

5. **Configure Webhook**
   - In your messaging service, set webhook URL to:
   - `https://yourdomain.com/api/notifications/sms/webhook`
   - Method: POST
   - Events: Incoming messages

### SMS Features Implemented

#### Intelligent Message Templates
- **Study Reminders**: Context-aware based on time of day, streak, urgency
- **Goal Deadlines**: Adaptive urgency based on progress and time remaining
- **Streak Maintenance**: Smart messaging for streak protection
- **Achievement Celebrations**: Milestone and progress acknowledgments
- **Break Reminders**: Burnout prevention with gentle interventions
- **Performance Alerts**: Encouraging or supportive based on performance

#### Interactive SMS Commands
Users can reply with:
- `STUDY` - Get direct link to start study session
- `YES` - Confirm action and get app link
- `HELP` - Get assistance and support info
- `STATS` - Receive progress statistics
- `MOTIVATE` - Get motivational message
- `BREAK` - Set a 10-minute break timer
- `MORE` - See all available commands
- `STOP` - Unsubscribe from SMS notifications

#### Smart Message Personalization
- **Time-aware**: Different messages for morning/evening
- **Context-sensitive**: Incorporates user's current goals, streaks, performance
- **Performance-adaptive**: More encouraging for struggling users
- **Deadline-aware**: Urgency increases as deadlines approach
- **Character-limited**: Auto-splits messages over 160 characters

#### Analytics & Tracking
- Message delivery status
- Response rates by message type
- User engagement metrics
- Command usage analytics
- Opt-out tracking

### Cost Optimization

#### Message Costs
- Twilio SMS: ~$0.0075 per message in US
- 160 character limit per message
- Smart message splitting for longer content

#### Best Practices
- Use messaging service for better deliverability
- Implement smart frequency limits
- Respect quiet hours
- Provide easy opt-out
- Track engagement to optimize timing

### Security Considerations

#### Webhook Security
- Validate Twilio signatures in production
- Use HTTPS endpoints only
- Rate limit incoming webhooks
- Log all interactions for debugging

#### User Privacy
- Store phone numbers securely
- Respect user preferences
- Provide clear opt-out mechanisms
- Follow SMS compliance regulations

### Testing

#### Development Testing
```bash
# Use Twilio Console to test messages
# Or use ngrok to expose local webhook:
npx ngrok http 3000
# Then set webhook to https://yourngrok.ngrok.io/api/notifications/sms/webhook
```

#### Production Checklist
- [ ] Valid Twilio credentials configured
- [ ] Phone number purchased and verified
- [ ] Webhook endpoint accessible via HTTPS
- [ ] Signature validation enabled
- [ ] Rate limiting configured
- [ ] Error handling tested
- [ ] User opt-out functionality working
- [ ] Analytics tracking operational

### Integration with Notification Service

The SMS service integrates seamlessly with the main notification system:

```typescript
// Example: Schedule an intelligent study reminder
await notificationService.createNotification({
  userId: 'user-123',
  type: 'study_reminder',
  priority: 'medium',
  title: 'Study Time!',
  message: 'Your 20-minute Logic Games session is ready.',
  channels: ['sms', 'push'], // Will send via both SMS and push
  metadata: {
    topicId: 'logic-games',
    estimatedDuration: 20,
    streak: 5
  }
});
```

The system will automatically:
- Check user's SMS preferences
- Select appropriate message template
- Personalize with user context
- Respect quiet hours
- Handle delivery and retries
- Track engagement analytics

### Troubleshooting

#### Common Issues
1. **Messages not sending**: Check Twilio credentials and phone number verification
2. **Webhook not receiving**: Verify HTTPS endpoint and Twilio configuration
3. **Invalid signature**: Ensure webhook validation is correctly implemented
4. **Rate limiting**: Implement exponential backoff for retries

#### Logs to Check
- Twilio delivery logs in console
- Application SMS logs in database
- Webhook request logs
- User preference settings
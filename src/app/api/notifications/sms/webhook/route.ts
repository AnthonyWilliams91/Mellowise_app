/**
 * Twilio SMS Webhook Handler
 * MELLOWISE-015: Handle incoming SMS responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { TwilioSMSService } from '@/lib/notifications/twilio-service';
import { createServerClient } from '@/lib/supabase/server';
import twilio from 'twilio';

const twilioWebhookSignature = process.env.TWILIO_AUTH_TOKEN || '';

/**
 * Handle incoming SMS messages from Twilio
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature for security
    const twilioSignature = request.headers.get('x-twilio-signature') || '';
    const url = request.url;
    const body = await request.text();

    // Validate webhook (in production, you'd validate the signature)
    if (process.env.NODE_ENV === 'production') {
      const isValid = twilio.validateRequest(
        twilioWebhookSignature,
        twilioSignature,
        url,
        body
      );

      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Parse Twilio webhook data
    const params = new URLSearchParams(body);
    const from = params.get('From');
    const messageBody = params.get('Body');
    const messageSid = params.get('MessageSid');

    if (!from || !messageBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Log incoming message
    await logIncomingSMS(from, messageBody, messageSid);

    // Process the message
    const smsService = new TwilioSMSService();
    const response = await smsService.handleIncomingSMS(from, messageBody);

    // Send response back to user
    const twiml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>${response}</Message>
      </Response>
    `;

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('SMS webhook error:', error);

    // Return error TwiML
    const errorTwiml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>Sorry, I'm having trouble right now. Please try again later or visit mellowise.com</Message>
      </Response>
    `;

    return new NextResponse(errorTwiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}

/**
 * Log incoming SMS for analytics and debugging
 */
async function logIncomingSMS(
  from: string,
  body: string,
  messageSid?: string
): Promise<void> {
  try {
    const supabase = createServerClient();

    await supabase
      .from('sms_incoming_log')
      .insert({
        phone_number: from,
        message_body: body,
        message_sid: messageSid,
        received_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Failed to log incoming SMS:', error);
  }
}

/**
 * Handle GET request for webhook verification
 */
export async function GET() {
  return NextResponse.json({
    message: 'Twilio SMS webhook endpoint',
    timestamp: new Date().toISOString()
  });
}
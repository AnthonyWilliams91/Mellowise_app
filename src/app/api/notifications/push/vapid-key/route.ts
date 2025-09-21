/**
 * VAPID Key Endpoint
 * MELLOWISE-015: Return VAPID public key for client subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import PushService from '@/lib/notifications/push-service';

export async function GET(request: NextRequest) {
  try {
    const pushService = new PushService();
    const publicKey = pushService.getVapidPublicKey();

    if (!publicKey) {
      return NextResponse.json(
        { error: 'VAPID keys not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({ publicKey });
  } catch (error) {
    console.error('Error getting VAPID key:', error);
    return NextResponse.json(
      { error: 'Failed to get VAPID key' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { demo } = await request.json();

    if (demo === true) {
      // Create a demo session token
      const demoSessionToken = Buffer.from(`demo-${Date.now()}`).toString('base64');

      const response = NextResponse.json({ success: true });

      // Set demo session cookie (same name as secret session to reuse middleware logic)
      response.cookies.set('secret-session', demoSessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/',
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid demo access request' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
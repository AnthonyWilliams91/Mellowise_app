import { NextRequest, NextResponse } from 'next/server';

const SECRET_ACCESS_CODE = process.env.SECRET_ACCESS_CODE || 'mellowise2024';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (code === SECRET_ACCESS_CODE) {
      // Create a simple session token
      const sessionToken = Buffer.from(Date.now().toString()).toString('base64');

      const response = NextResponse.json({ success: true });

      // Set secure httpOnly cookie
      response.cookies.set('secret-session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/',
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid access code' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
# Google OAuth Setup for Waitlist System

**Purpose**: Enable "Continue with Google" signup on the waitlist landing page

**Time Required**: 10 minutes

---

## Step 1: Create Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. **Project Name**: `Mellowise Waitlist` (or similar)
4. **Organization**: Leave blank (or select if you have one)
5. Click **"Create"**

---

## Step 2: Configure OAuth Consent Screen

1. In Google Cloud Console, navigate to: **APIs & Services** → **OAuth consent screen**
2. Select **External** user type
3. Click **"Create"**

### App Information:
- **App name**: `Mellowise`
- **User support email**: Your email
- **App logo**: (Optional - upload Mellowise logo)
- **Application home page**: `https://mellowise.com`
- **Application privacy policy link**: `https://mellowise.com/privacy`
- **Application terms of service link**: `https://mellowise.com/terms`

### Developer Contact:
- **Email addresses**: Your email

4. Click **"Save and Continue"**

### Scopes:
5. Click **"Add or Remove Scopes"**
6. Select these scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
7. Click **"Update"** → **"Save and Continue"**

### Test Users (Development Only):
8. Add 2-3 test email addresses (your email + team members)
9. Click **"Save and Continue"**

10. Review summary → Click **"Back to Dashboard"**

---

## Step 3: Create OAuth Credentials

1. Navigate to: **APIs & Services** → **Credentials**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**

### Configure OAuth Client:
- **Application type**: `Web application`
- **Name**: `Mellowise Waitlist Web Client`

### Authorized JavaScript origins:
Add these URLs:
```
http://localhost:3000
https://mellowise.com
https://*.vercel.app
```

### Authorized redirect URIs:
Add these Supabase callback URLs:
```
http://localhost:3000/auth/callback
https://kptfedjloznfgvlocthf.supabase.co/auth/v1/callback
https://mellowise.com/auth/callback
https://*.vercel.app/auth/callback
```

3. Click **"Create"**

### Copy Credentials:
4. **Copy the Client ID** (starts with something like `123456789-abc...googleusercontent.com`)
5. **Copy the Client Secret** (random string)

---

## Step 4: Configure Supabase

1. Go to: https://supabase.com/dashboard/project/kptfedjloznfgvlocthf/auth/providers
2. Find **Google** provider
3. Click to expand

### Enter Credentials:
- **Enabled**: Toggle ON
- **Client ID**: Paste the Client ID from Step 3
- **Client Secret**: Paste the Client Secret from Step 3

### Redirect URL:
4. Copy the redirect URL shown (should be `https://kptfedjloznfgvlocthf.supabase.co/auth/v1/callback`)
5. Verify this matches the URL you added in Step 3

6. Click **"Save"**

---

## Step 5: Test OAuth Flow

### Test in Development:
1. Start Next.js dev server: `npm run dev`
2. Go to: `http://localhost:3000/landing` (once landing page is built)
3. Click **"Continue with Google"**
4. Should redirect to Google login
5. After login, should redirect back to success page

### Expected Flow:
```
Landing Page
  ↓ (Click "Continue with Google")
Google Login Screen
  ↓ (User enters email/password)
Google Permission Screen
  ↓ (User clicks "Allow")
Supabase Auth Callback
  ↓ (Creates user session)
Success Page (/waitlist/success)
```

---

## Step 6: Environment Variables (Already Set)

Your `.env.local` already has:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://kptfedjloznfgvlocthf.supabase.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

✅ **No additional env vars needed** - Google OAuth credentials are stored in Supabase dashboard.

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
- **Cause**: The redirect URI doesn't match what's configured in Google Cloud Console
- **Fix**: Add the exact redirect URI to Google Cloud Console (Step 3)

### Error: "Access blocked: This app's request is invalid"
- **Cause**: OAuth consent screen not configured properly
- **Fix**: Complete Step 2 fully, including scopes

### Error: "This app isn't verified"
- **Cause**: App is in testing mode (expected for development)
- **Fix**: Click "Advanced" → "Go to Mellowise (unsafe)" during testing
- **Production Fix**: Submit app for Google verification (takes 1-2 weeks)

### User doesn't get redirected back
- **Cause**: Supabase callback URL not added to Google Cloud Console
- **Fix**: Verify all redirect URIs in Step 3 match Supabase settings

---

## Production Deployment Checklist

Before going live:

- [ ] Add production domain to Google Cloud Console redirect URIs
- [ ] Add production domain to Supabase allowed redirect URLs
- [ ] Submit app for Google verification (for "This app isn't verified" warning removal)
- [ ] Switch OAuth consent screen from Testing to Production
- [ ] Remove test user restrictions

---

## Verification Commands

Test that Supabase Auth is configured:
```bash
# Check Supabase providers (requires Supabase CLI)
supabase inspect db --schema auth

# Or test via API:
curl https://kptfedjloznfgvlocthf.supabase.co/auth/v1/settings
```

---

## Next Steps

Once Google OAuth is configured:
1. Build landing page signup form (Day 2)
2. Implement "Continue with Google" button
3. Create success page to show after signup
4. Test full signup flow

---

**Estimated Setup Time**: 10-15 minutes

**Support**: If you encounter issues, check Supabase docs: https://supabase.com/docs/guides/auth/social-login/auth-google

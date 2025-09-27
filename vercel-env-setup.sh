#!/bin/bash

echo "Setting up Vercel environment variables..."

# Set the secret access code (required)
vercel env add SECRET_ACCESS_CODE production <<< "mellowise2024"

# Set placeholder values for required env vars (you can update these later)
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://placeholder.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "placeholder_anon_key"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "placeholder_service_key"

# Optional: Set placeholder values for other services
vercel env add ANTHROPIC_API_KEY production <<< "placeholder_anthropic_key"
vercel env add OPENAI_API_KEY production <<< "placeholder_openai_key"
vercel env add STRIPE_PUBLISHABLE_KEY production <<< "placeholder_stripe_pub_key"
vercel env add STRIPE_SECRET_KEY production <<< "placeholder_stripe_secret_key"
vercel env add SENTRY_DSN production <<< "placeholder_sentry_dsn"

echo "Environment variables set! You can update them later in the Vercel dashboard."
echo "Visit: https://vercel.com/anthonys-projects-162ce293/mellowise-app/settings/environment-variables"
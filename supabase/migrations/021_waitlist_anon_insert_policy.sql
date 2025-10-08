-- Allow anonymous/authenticated users to INSERT into waitlist_users
-- This is needed for the signup flow where users add themselves to the waitlist

CREATE POLICY "Allow anon insert for signup"
  ON waitlist_users FOR INSERT
  WITH CHECK (true);

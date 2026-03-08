-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'inactive',
  plan text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own subscription
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for service role to manage subscriptions (admin/webhook)
-- Note: Service role bypasses RLS, but this is good practice for explicit grants if needed
-- However, we don't need explicit policies for service role as it bypasses RLS by default.

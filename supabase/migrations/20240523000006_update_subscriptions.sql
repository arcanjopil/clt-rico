-- Create subscriptions table
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text,
  status text default 'active',
  current_period_end timestamp,
  created_at timestamp default now(),
  unique(user_id)
);

alter table subscriptions enable row level security;

create policy "Users can view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

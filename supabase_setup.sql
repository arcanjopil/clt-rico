-- Create a table for user data
create table user_data (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  data jsonb default '{}'::jsonb
);

-- Set up Row Level Security (RLS)
alter table user_data enable row level security;

-- Policy: Users can only see their own data
create policy "Users can view their own data." on user_data
  for select using (auth.uid() = id);

-- Policy: Users can insert their own data
create policy "Users can insert their own data." on user_data
  for insert with check (auth.uid() = id);

-- Policy: Users can update their own data
create policy "Users can update their own data." on user_data
  for update using (auth.uid() = id);

-- Trigger to handle updated_at
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on user_data
  for each row execute procedure moddatetime (updated_at);

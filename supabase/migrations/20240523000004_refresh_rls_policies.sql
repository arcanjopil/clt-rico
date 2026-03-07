
-- Drop existing policies to start fresh
drop policy if exists "Users can view their own data" on user_data;
drop policy if exists "Users can insert their own data" on user_data;
drop policy if exists "Users can update their own data" on user_data;

-- Re-enable RLS (just in case)
alter table user_data enable row level security;

-- Create comprehensive policies
-- 1. SELECT: Users can see rows where user_id matches their auth.uid()
create policy "Enable read access for users based on user_id"
on user_data for select
using (auth.uid() = user_id);

-- 2. INSERT: Users can insert rows where user_id matches their auth.uid()
create policy "Enable insert access for users based on user_id"
on user_data for insert
with check (auth.uid() = user_id);

-- 3. UPDATE: Users can update rows where user_id matches their auth.uid()
create policy "Enable update access for users based on user_id"
on user_data for update
using (auth.uid() = user_id);

-- 4. UPSERT needs both INSERT and UPDATE permissions
-- The above policies cover this, but let's be explicit about the unique constraint behavior
-- The 'unique' constraint on user_id is already there (verified by schema).

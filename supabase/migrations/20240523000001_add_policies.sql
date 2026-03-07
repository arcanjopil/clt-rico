
-- Enable RLS
alter table user_data enable row level security;

-- Create policies
create policy "Users can view their own data"
on user_data for select
using (auth.uid() = user_id);

create policy "Users can insert their own data"
on user_data for insert
with check (auth.uid() = user_id);

create policy "Users can update their own data"
on user_data for update
using (auth.uid() = user_id);

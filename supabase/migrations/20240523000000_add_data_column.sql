
alter table user_data 
add column if not exists data jsonb default '{}'::jsonb;

create index if not exists idx_user_data_user_id on user_data(user_id);

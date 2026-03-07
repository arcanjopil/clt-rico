
-- Add unique constraint to user_id to enable upsert by user_id
alter table user_data
add constraint user_data_user_id_key unique (user_id);

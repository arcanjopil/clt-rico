
-- Remove duplicates first (keep latest updated)
delete from user_data a using user_data b
where a.id < b.id 
and a.user_id = b.user_id;

-- Now add the constraint
alter table user_data
add constraint user_data_user_id_key unique (user_id);

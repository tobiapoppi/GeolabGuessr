delete from public.profiles
where user_id in (
  select id from auth.users where email = 'tobi1modna@gmail.com'
)
or display_name ilike 'luca';

delete from auth.users
where email = 'tobi1modna@gmail.com';

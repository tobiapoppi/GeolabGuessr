insert into private.admin_credentials (username, password_hash)
values ('admin', crypt('CAMBIA_QUESTA_PASSWORD', gen_salt('bf')))
on conflict (username) do update
set password_hash = excluded.password_hash,
    updated_at = now();

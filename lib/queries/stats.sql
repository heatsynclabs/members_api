select
  (select count(*) from users where deleted_at IS NULL) as user_count,
  (select count(*) from users where deleted_at IS NULL AND created_at > NOW() - interval '14 days') as new_user_count,
  (select count(*) from user_certifications) as user_certs,
  (select count(*) from user_certifications where created_at > NOW() - interval '14 days') as new_cert_count

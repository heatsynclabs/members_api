select
	id,
	name,
	member_level,
	md5(lower(email)) gravatar,
	created_at
from users
where
is_validated = true
AND deleted_at IS NULL
order by created_at desc
Limit 10

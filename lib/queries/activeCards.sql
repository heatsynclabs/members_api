select
  c.card_number as num,
  c.permissions as perms,
  u.id as user_id
from 
	cards c,
	users u
where
  c.user_id = u.id
  and u.is_deleted = false
  and u.deleted_at is null;
  
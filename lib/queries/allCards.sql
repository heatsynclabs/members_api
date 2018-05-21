select
  c.*,
  u.name,
  u.member_level
from
  cards c, 
  users u
where
  u.id = c.user_id
order by
  u.name

SELECT
  t.user_id,
  u.version
FROM
  users u,
  time_token t
WHERE
  u.id = t.user_id AND
  t.used_at IS NULL AND
  t.created_at >= NOW() - interval '2 day' AND
  t.id = ?

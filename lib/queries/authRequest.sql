SELECT
  u.id,
  u.password,
  u.email,
  u.is_validated,
  u.is_deleted,
  u.version,
  u.name,
  COALESCE(
    (
      SELECT json_agg(memberships.group_id)
      FROM memberships
      WHERE user_id = u.id
    ), '[]'::json
  ) AS scope
FROM
  users AS u
WHERE
  u.email = ?

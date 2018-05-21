select
  u.id,
  u.name,
  u.email,
  u.email_visible,
  u.phone,
  u.waiver,
  u.orientation,
  u.facebook_url,
  u.github_url,
  u.twitter_url,
  u.website_url,
  u.created_at,
  u.postal_code,
  u.member_level,
  COALESCE(
    (
      SELECT json_agg(certs.name)
      FROM certifications certs, user_certifications ucerts
      WHERE ucerts.user_id = u.id
      AND certs.id = ucerts.cert_id
    ), '[]'::json
  ) AS user_certs
  FROM
    users AS u
  WHERE
    u.deleted_at IS NULL

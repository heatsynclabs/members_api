select count(*) as count,
substring(trim(postal_code), 1, 5) as postal_code from users 
where
postal_code is not null
and trim (postal_code) != ''
and deleted_at is null
and is_deleted = false
and char_length(postal_code) > 4
group by substring(trim(postal_code), 1, 5)
order by count desc;
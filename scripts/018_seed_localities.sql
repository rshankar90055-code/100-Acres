-- Seed localities for each city
-- Get city IDs and insert localities

-- Davangere localities
insert into localities (city_id, name, slug, latitude, longitude) 
select id, 'MCC B Block', 'mcc-b-block', 14.4644, 75.9218 from cities where slug = 'davangere'
on conflict do nothing;

insert into localities (city_id, name, slug, latitude, longitude) 
select id, 'Vidyanagar', 'vidyanagar', 14.4589, 75.9156 from cities where slug = 'davangere'
on conflict do nothing;

insert into localities (city_id, name, slug, latitude, longitude) 
select id, 'PJ Extension', 'pj-extension', 14.4672, 75.9234 from cities where slug = 'davangere'
on conflict do nothing;

insert into localities (city_id, name, slug, latitude, longitude) 
select id, 'Saraswathipuram', 'saraswathipuram', 14.4512, 75.9189 from cities where slug = 'davangere'
on conflict do nothing;

insert into localities (city_id, name, slug, latitude, longitude) 
select id, 'Ashok Nagar', 'ashok-nagar', 14.4701, 75.9267 from cities where slug = 'davangere'
on conflict do nothing;

-- Hubli localities
insert into localities (city_id, name, slug, latitude, longitude) 
select id, 'Vidyanagar', 'vidyanagar', 15.3647, 75.1240 from cities where slug = 'hubli'
on conflict do nothing;

insert into localities (city_id, name, slug, latitude, longitude) 
select id, 'Keshwapur', 'keshwapur', 15.3589, 75.1312 from cities where slug = 'hubli'
on conflict do nothing;

insert into localities (city_id, name, slug, latitude, longitude) 
select id, 'Gokul Road', 'gokul-road', 15.3712, 75.1156 from cities where slug = 'hubli'
on conflict do nothing;

insert into localities (city_id, name, slug, latitude, longitude) 
select id, 'Navanagar', 'navanagar', 15.3534, 75.1423 from cities where slug = 'hubli'
on conflict do nothing;

-- Mysore localities
insert into localities (city_id, name, slug, latitude, longitude) 
select id, 'Vijayanagar', 'vijayanagar', 12.3156, 76.6234 from cities where slug = 'mysore'
on conflict do nothing;

insert into localities (city_id, name, slug, latitude, longitude) 
select id, 'Kuvempunagar', 'kuvempunagar', 12.2978, 76.6312 from cities where slug = 'mysore'
on conflict do nothing;

insert into localities (city_id, name, slug, latitude, longitude) 
select id, 'Jayalakshmipuram', 'jayalakshmipuram', 12.3089, 76.6456 from cities where slug = 'mysore'
on conflict do nothing;

insert into localities (city_id, name, slug, latitude, longitude) 
select id, 'Gokulam', 'gokulam', 12.3234, 76.6178 from cities where slug = 'mysore'
on conflict do nothing;

-- Belgaum localities
insert into localities (city_id, name, slug, latitude, longitude) 
select id, 'Tilakwadi', 'tilakwadi', 15.8512, 74.4978 from cities where slug = 'belgaum'
on conflict do nothing;

insert into localities (city_id, name, slug, latitude, longitude) 
select id, 'Sadashivnagar', 'sadashivnagar', 15.8634, 74.5012 from cities where slug = 'belgaum'
on conflict do nothing;

insert into localities (city_id, name, slug, latitude, longitude) 
select id, 'Camp', 'camp', 15.8589, 74.5089 from cities where slug = 'belgaum'
on conflict do nothing;

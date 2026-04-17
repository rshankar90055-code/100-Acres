-- Seed data for 100acres Real Estate Platform
-- Sample cities, agents, and properties for Karnataka Tier-2/Tier-3 cities

-- Insert sample cities
INSERT INTO public.cities (id, name, slug, state, is_active, hero_image_url, description, property_count, agent_count) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Davangere', 'davangere', 'Karnataka', true, 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800', 'The Manchester of Karnataka - A growing industrial hub with excellent real estate opportunities.', 0, 0),
  ('c1000000-0000-0000-0000-000000000002', 'Hubli', 'hubli', 'Karnataka', true, 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800', 'Commercial capital of North Karnataka with rapid infrastructure development.', 0, 0),
  ('c1000000-0000-0000-0000-000000000003', 'Dharwad', 'dharwad', 'Karnataka', true, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', 'Educational hub known for its universities and peaceful residential areas.', 0, 0),
  ('c1000000-0000-0000-0000-000000000004', 'Mysore', 'mysore', 'Karnataka', true, 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800', 'The City of Palaces - Premium real estate destination in Karnataka.', 0, 0),
  ('c1000000-0000-0000-0000-000000000005', 'Belgaum', 'belgaum', 'Karnataka', true, 'https://images.unsplash.com/photo-1464938050520-ef2571f1f77e?w=800', 'Border city with growing IT sector and affordable housing options.', 0, 0),
  ('c1000000-0000-0000-0000-000000000006', 'Mangalore', 'mangalore', 'Karnataka', true, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'Coastal city with booming real estate and port-driven economy.', 0, 0),
  ('c1000000-0000-0000-0000-000000000007', 'Bellary', 'bellary', 'Karnataka', true, 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800', 'Mining hub with emerging residential and commercial projects.', 0, 0),
  ('c1000000-0000-0000-0000-000000000008', 'Shimoga', 'shimoga', 'Karnataka', true, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 'Gateway to Malnad region with scenic properties and hill stations nearby.', 0, 0)
ON CONFLICT (slug) DO NOTHING;

-- Insert area insights for Davangere
INSERT INTO public.area_insights (city_id, locality, water_supply_rating, power_supply_rating, safety_rating, connectivity_rating, schools_nearby, hospitals_nearby, markets_nearby, public_transport, average_rent, average_price_sqft) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'MCC B Block', 5, 5, 5, 4, ARRAY['Rotary School', 'DPS Davangere', 'St. Philomenas'], ARRAY['SSIMS Hospital', 'Chigateri Hospital'], ARRAY['MCC Market', 'Big Bazaar'], ARRAY['City Bus', 'Auto Rickshaw'], 12000, 3500),
  ('c1000000-0000-0000-0000-000000000001', 'Vidyanagar', 4, 5, 4, 4, ARRAY['Vidya Niketan School', 'KLE School'], ARRAY['Bapuji Hospital'], ARRAY['Vidyanagar Market'], ARRAY['City Bus', 'Auto Rickshaw'], 10000, 3000),
  ('c1000000-0000-0000-0000-000000000001', 'Saraswathipuram', 5, 5, 5, 5, ARRAY['St. Johns School', 'Cambridge School'], ARRAY['Basaveshwara Hospital'], ARRAY['AVK College Road Market'], ARRAY['City Bus', 'Auto Rickshaw'], 15000, 4000)
ON CONFLICT DO NOTHING;

-- Insert area insights for Hubli
INSERT INTO public.area_insights (city_id, locality, water_supply_rating, power_supply_rating, safety_rating, connectivity_rating, schools_nearby, hospitals_nearby, markets_nearby, public_transport, average_rent, average_price_sqft) VALUES
  ('c1000000-0000-0000-0000-000000000002', 'Vidyanagar', 5, 5, 5, 5, ARRAY['BVB College', 'KLE College'], ARRAY['KIMS Hospital', 'SDM Hospital'], ARRAY['Vidyanagar Market', 'CBT'], ARRAY['City Bus', 'Railway Station Nearby'], 18000, 4500),
  ('c1000000-0000-0000-0000-000000000002', 'Gokul Road', 4, 5, 4, 5, ARRAY['St. Pauls School', 'Lions School'], ARRAY['Manjunath Hospital'], ARRAY['Gokul Road Market'], ARRAY['City Bus', 'Auto Rickshaw'], 14000, 3800),
  ('c1000000-0000-0000-0000-000000000002', 'Navanagar', 5, 5, 5, 4, ARRAY['Navanagar School', 'Cambridge Academy'], ARRAY['Lifecare Hospital'], ARRAY['Navanagar Complex'], ARRAY['City Bus', 'Auto Rickshaw'], 16000, 4200)
ON CONFLICT DO NOTHING;

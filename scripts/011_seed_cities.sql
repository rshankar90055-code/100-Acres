-- Seed Karnataka Tier-2/3 cities
insert into cities (name, slug, description) values
  ('Davangere', 'davangere', 'The Manchester of Karnataka, known for its cotton industry and rich cultural heritage.'),
  ('Hubli-Dharwad', 'hubli-dharwad', 'The twin cities serving as the commercial and educational hub of North Karnataka.'),
  ('Mysore', 'mysore', 'The City of Palaces, famous for its royal heritage, silk, and sandalwood.'),
  ('Mangalore', 'mangalore', 'A major port city known for its beautiful beaches, temples, and diverse cuisine.'),
  ('Belgaum', 'belgaum', 'A historic city known for its pleasant climate, forts, and educational institutions.'),
  ('Shimoga', 'shimoga', 'The Gateway to Malnad, surrounded by lush forests and waterfalls.'),
  ('Tumkur', 'tumkur', 'The Coconut City, an emerging industrial and educational center.'),
  ('Gulbarga', 'gulbarga', 'A historic city known for Sufi shrines and the famous Gulbarga Fort.'),
  ('Bellary', 'bellary', 'A mineral-rich city with ancient Vijayanagara heritage sites nearby.'),
  ('Bidar', 'bidar', 'Known for its Bidriware handicrafts and impressive medieval architecture.'),
  ('Raichur', 'raichur', 'An agricultural hub famous for rice production and thermal power plants.'),
  ('Hassan', 'hassan', 'Gateway to the famous Hoysala temples of Belur and Halebidu.'),
  ('Udupi', 'udupi', 'A coastal town famous for its temples, beaches, and distinctive cuisine.'),
  ('Chitradurga', 'chitradurga', 'Home to the impressive Stone Fortress and rich Nayaka heritage.'),
  ('Mandya', 'mandya', 'The Sugar Bowl of Karnataka, known for sugarcane and KRS Dam.')
on conflict (slug) do nothing;

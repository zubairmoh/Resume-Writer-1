-- ProResumes Database Seed Script
-- Password for all users: password123
-- Hash generated using bcrypt with 10 rounds

-- Clear existing test users (optional - uncomment if needed)
-- DELETE FROM users WHERE username IN ('admin', 'writer1', 'client1');

-- Insert Admin User
INSERT INTO users (id, username, password, email, full_name, role, created_at)
VALUES (
  gen_random_uuid(),
  'admin',
  '$2b$10$YIkpWdUrUWgg4aN4g0VJ5OTXgP.l7/rPqq3e03HueRxgXFuG2xkfe',
  'admin@proresumes.com',
  'System Admin',
  'admin',
  NOW()
)
ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password;

-- Insert Writer User
INSERT INTO users (id, username, password, email, full_name, role, created_at)
VALUES (
  gen_random_uuid(),
  'writer1',
  '$2b$10$YIkpWdUrUWgg4aN4g0VJ5OTXgP.l7/rPqq3e03HueRxgXFuG2xkfe',
  'writer1@proresumes.com',
  'John Writer',
  'writer',
  NOW()
)
ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password;

-- Insert Client User
INSERT INTO users (id, username, password, email, full_name, role, created_at)
VALUES (
  gen_random_uuid(),
  'client1',
  '$2b$10$YIkpWdUrUWgg4aN4g0VJ5OTXgP.l7/rPqq3e03HueRxgXFuG2xkfe',
  'client1@proresumes.com',
  'Jane Client',
  'client',
  NOW()
)
ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password;

-- Verify users were created
SELECT id, username, email, role, LEFT(password, 20) as password_preview FROM users;

-- Create an admin user for testing
-- Note: This is for development/testing purposes only
-- In production, create admin users through a secure process

-- First, you'll need to hash the password using bcrypt
-- The password "Admin123!" will be hashed to something like:
-- $2a$12$LQv3c1yqBwEHxv68JaCyve.GLFzmNiJ6BpbkmENI.hhHOxK9H/pKm

INSERT INTO users (
  name,
  email,
  password,
  role,
  phone,
  dateOfBirth,
  address,
  isBlocked,
  createdAt,
  updatedAt
) VALUES (
  'System Administrator',
  'admin@studentfeedback.com',
  '$2a$12$LQv3c1yqBwEHxv68JaCyve.GLFzmNiJ6BpbkmENI.hhHOxK9H/pKm', -- Admin123!
  'admin',
  '1234567890',
  '1990-01-01',
  '123 Admin Street, Admin City, AC 12345',
  false,
  NOW(),
  NOW()
);

-- Create some sample courses for testing
INSERT INTO courses (
  name,
  code,
  description,
  instructor,
  credits,
  isActive,
  createdAt,
  updatedAt
) VALUES 
(
  'Introduction to Computer Science',
  'CS101',
  'Fundamental concepts of computer science including programming, algorithms, and data structures.',
  'Dr. John Smith',
  3,
  true,
  NOW(),
  NOW()
),
(
  'Database Management Systems',
  'CS301',
  'Design and implementation of database systems, SQL, and database administration.',
  'Prof. Sarah Johnson',
  4,
  true,
  NOW(),
  NOW()
),
(
  'Web Development',
  'CS250',
  'Modern web development techniques including HTML, CSS, JavaScript, and frameworks.',
  'Dr. Michael Brown',
  3,
  true,
  NOW(),
  NOW()
),
(
  'Data Structures and Algorithms',
  'CS201',
  'Advanced data structures, algorithm design, and complexity analysis.',
  'Prof. Emily Davis',
  4,
  true,
  NOW(),
  NOW()
),
(
  'Software Engineering',
  'CS350',
  'Software development lifecycle, project management, and team collaboration.',
  'Dr. Robert Wilson',
  3,
  true,
  NOW(),
  NOW()
);

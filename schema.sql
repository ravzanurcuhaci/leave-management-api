DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS leave_balances;
DROP TABLE IF EXISTS leave_types;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,

  role_id INT NOT NULL REFERENCES roles(id),
  manager_id INT REFERENCES users(id),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leave_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  default_days INT NOT NULL CHECK (default_days >= 0)
);

CREATE TABLE leave_balances (
  id SERIAL PRIMARY KEY,

  user_id INT NOT NULL REFERENCES users(id),
  leave_type_id INT NOT NULL REFERENCES leave_types(id),

  remaining_days INT NOT NULL CHECK (remaining_days >= 0),

  UNIQUE (user_id, leave_type_id)
);

CREATE TABLE leave_requests (
  id SERIAL PRIMARY KEY,

  user_id INT NOT NULL REFERENCES users(id),
  leave_type_id INT NOT NULL REFERENCES leave_types(id),

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INT NOT NULL CHECK (total_days > 0),

  reason TEXT,

  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),

  reviewed_by INT REFERENCES users(id),
  reviewed_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CHECK (end_date >= start_date)
);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,

  actor_user_id INT REFERENCES users(id),

  action VARCHAR(100) NOT NULL,

  target_type VARCHAR(100) NOT NULL,
  target_id INT NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (name)
VALUES
  ('Employee'),
  ('Manager'),
  ('Admin');

INSERT INTO leave_types (name, default_days)
VALUES
  ('Annual Leave', 14),
  ('Sick Leave', 10);
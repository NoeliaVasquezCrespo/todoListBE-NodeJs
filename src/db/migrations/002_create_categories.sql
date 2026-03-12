CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(250) UNIQUE NOT NULL,
    description VARCHAR(250) NOT NULL,
    color VARCHAR(8) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
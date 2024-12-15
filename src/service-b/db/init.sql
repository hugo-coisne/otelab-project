-- Create the database
CREATE DATABASE IF NOT EXISTS db;

-- Use the database
USE db;

-- Create the statement table
CREATE TABLE IF NOT EXISTS statement (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    value VARCHAR(50)
);

-- Insert data into the statement table
INSERT INTO statement (id, name, surname) VALUES
    (1, 1, 'This is a statement.'),
    (2, 1, 'This is another statement from the same user.'),
    (3, 2, 'This is a statement from another user.');

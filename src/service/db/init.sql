-- Create the database
CREATE DATABASE IF NOT EXISTS db;

-- Use the database
USE db;

-- Create the user table
CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    surname VARCHAR(50)
);

-- Insert data into the user table
INSERT INTO user (id, name, surname) VALUES
    (1, 'hugo', 'coisne'),
    (2, 'leo', 'saintier'),
    (3, 'fabio', 'petrillo');

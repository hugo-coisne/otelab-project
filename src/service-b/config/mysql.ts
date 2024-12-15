import mysql from "mysql2";

// Create a connection to the database
const connection = mysql.createConnection({
  host: "localhost", // Replace with your DB host
  port: 3307,
  user: "user", // Replace with your DB username
  password: "pwd", // Replace with your DB password
  database: "db", // Replace with your DB name
});


export default connection;
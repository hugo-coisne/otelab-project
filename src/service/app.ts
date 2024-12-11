import express, { Express } from "express";
import UserController from "./main/UserController";
import connection from "./config/mysql";

const PORT: number = parseInt(process.env.SERVICE_PORT || "8080");
const app: Express = express();

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
    return;
  }
  console.log("Connected to the database");
});

app.use("/", UserController);
app.listen(PORT, () => {
  console.log(`Listening for requests on ${PORT}`);
});

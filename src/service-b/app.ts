import express, { Express } from "express";
import connection from "./config/mysql";
import StatementController from "./main/StatementController";

const PORT: number = parseInt(process.env.SERVICE_B_PORT || "8081");
const app: Express = express();
app.use(express.json());

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
    return;
  }
  console.log("Connected to the database");
});

app.use("/", StatementController);

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});

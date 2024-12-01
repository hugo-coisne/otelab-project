import express, { Express } from "express";

import UserController from "./UserController";

const PORT: number = parseInt(process.env.SERVICE_PORT || "8080");
const app: Express = express();

app.use('/', UserController)

app.listen(PORT, () => {
  console.log(`Listening for requests on port ${PORT}`);
});

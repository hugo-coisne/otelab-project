import express, { Request, Response } from "express";
import { getLogger } from "../config/logger";
import { metrics, Span, trace } from "@opentelemetry/api";
import User from "../models/User";
import UserService from "./UserService";

const userController = express.Router();
const logger = getLogger();
const tracer = trace.getTracer("service-a");

const meter = metrics.getMeter("service-a");
const totalRequestCounter = meter.createCounter("total-request.counter");

const userService = UserService.getInstance();

// GET: Retrieve all users
userController.get("/users", async (req, res) => {
  const histogram = meter.createHistogram("get.users.duration");
  const startTime = new Date().getTime();

  totalRequestCounter.add(1);
  logger.info("Fetching all users.");
  const users = await userService.getUsers();
  res.json(users);

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});

// POST: Add a new user
userController.post("/users", async (req, res) => {
  const histogram = meter.createHistogram("post.users.duration");
  const startTime = new Date().getTime();
  totalRequestCounter.add(1);
  
  const users = await userService.createUser(req.body as User);
  res.status(200).json(users);
  logger.info("User successfully added.");

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});

// PUT: Replace an existing user by id
userController.put("/users/:id", async (req, res) => {
  const histogram = meter.createHistogram("put.users.duration");
  const startTime = new Date().getTime();

  totalRequestCounter.add(1);
  const newUser = await userService.updateUser(req.body as User);
  res.status(200).json(newUser);
  logger.info(`PUT request completed with status 200.`);

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});

// PATCH: Partially update a user by id
userController.patch("/users/:id", async (req, res) => {
  const histogram = meter.createHistogram("patch.users.duration");
  const startTime = new Date().getTime();

  totalRequestCounter.add(1);
  const newUser = await userService.updateUser(req.body as User);
  res.status(200).json(newUser);
  logger.info(`PATCH request completed with status 200.`);

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});

userController.delete("/users/:id", async (req, res) => {
  const histogram = meter.createHistogram("delete.users.duration");
  const startTime = new Date().getTime();

  totalRequestCounter.add(1);
  const deletedUser = userService.deleteUser(req.body as User);
  res.status(200).json(deletedUser);
  logger.info(`DELETE request completed with status 200.`);

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});

function errorCreator() {
  return tracer.startActiveSpan("errorCreator", (span: Span) => {
    let data: { status: number; content: any } = { status: -1, content: null };
    try {
      throw new Error("Useless error message");
    } catch (error) {
      if (error instanceof Error) {
        data = { status: 400, content: error.message };
        logger.error(`Error caught: ${error.message}`);
      } else {
        data = { status: 400, content: "Unexpected error" };
        logger.error("Unexpected error occurred.");
      }
    }
    span.end();
    return data;
  });
}

userController.get("/error", (req, res) => {
  const histogram = meter.createHistogram("GET.error.duration");
  const startTime = new Date().getTime();

  totalRequestCounter.add(1);
  const data = errorCreator();
  logger.info("throwing useless error");
  res.status(data.status).json(data.content);

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});

export default userController;

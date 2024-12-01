import express, { Request, Response } from "express";
import { getLogger } from "./logger";
import { metrics, Span, trace } from "@opentelemetry/api";
import User from "./User";
import UserService from "./UserService";

const userController = express.Router();
const logger = getLogger();
const tracer = trace.getTracer("user service", "0.1.0");

const meter = metrics.getMeter("user service", "0.1.0");
const totalRequestCounter = meter.createCounter("total-request.counter");

const userService = UserService.getInstance()

// GET: Retrieve all users
userController.get("/users", (req, res) => {
  const histogram = meter.createHistogram("get.users.duration");
  const startTime = new Date().getTime();

  totalRequestCounter.add(1);
  logger.info("Fetching all users.");
  const users = userService.getUsers();
  res.json(users);

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});

function postHandler(req: Request) {
  return tracer.startActiveSpan("userPostHandler", (span: Span) => {
    const users = userService.getUsers();
    const maxId =
      users.length > 0 ? Math.max(...users.map((user: User) => user.id)) : 0;
    const user: User = {
      id: maxId + 1, // Generate a unique ID
      name: req.query.name!.toString(),
      surname: req.query.surname!.toString(),
    };
    users.push(user);
    userService.updateUsers(users);
    logger.info(`New user created: ${JSON.stringify(user)}`);
    span.end();
  });
}

// POST: Add a new user
userController.post("/users", (req, res) => {
  const histogram = meter.createHistogram("post.users.duration");
  const startTime = new Date().getTime();
  totalRequestCounter.add(1);
  postHandler(req);
  const users = userService.getUsers();
  res.status(200).json(users[users.length - 1]);
  logger.info("User successfully added.");

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});

function putHandler(req: Request) {
  return tracer.startActiveSpan("userPutHandler", (span: Span) => {
    const userId = parseInt(req.params.id);
    const users = userService.getUsers()
    const userIndex = users.findIndex((user) => user.id === userId);
    let data: { status: number; content: any } = { status: -1, content: null };

    if (userIndex !== -1) {
      const updatedUser: User = {
        id: userId,
        name: req.query.name!.toString(),
        surname: req.query.surname!.toString(),
      };
      users[userIndex] = updatedUser;
      data = { status: 200, content: updatedUser };
      logger.info(`User updated: ${JSON.stringify(updatedUser)}`);
    } else {
      data = { status: 404, content: "User not found" };
      logger.warn(`User with id ${userId} not found.`);
    }
    span.end();
    return data;
  });
}

// PUT: Replace an existing user by id
userController.put("/users/:id", (req, res) => {
  const histogram = meter.createHistogram("put.users.duration");
  const startTime = new Date().getTime();

  totalRequestCounter.add(1);
  const data: { status: number; content: string } = putHandler(req);
  res.status(data.status).json(data.content);
  logger.info(`PUT request completed with status ${data.status}.`);

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});

function patchHandler(req: Request) {
  return tracer.startActiveSpan("userPatchHandler", (span: Span) => {
    let data: { status: number; content: any } = { status: -1, content: null };
    const userId = parseInt(req.params.id);
    const users = userService.getUsers()
    const user = users.find((u) => u.id === userId);

    if (user) {
      if (req.query.name) {
        user.name = req.query.name!.toString();
        logger.info(`Updated user name to: ${user.name}`);
      }
      if (req.query.surname) {
        user.surname = req.query.surname!.toString();
        logger.info(`Updated user surname to: ${user.surname}`);
      }
      data = { status: 200, content: user };
    } else {
      data = { status: 404, content: "User not found" };
      logger.warn(`User with id ${userId} not found.`);
    }
    span.end();
    return data;
  });
}

// PATCH: Partially update a user by id
userController.patch("/users/:id", (req, res) => {
  const histogram = meter.createHistogram("patch.users.duration");
  const startTime = new Date().getTime();

  totalRequestCounter.add(1);
  const data: { status: number; content: string } = patchHandler(req);
  res.status(data.status).json(data.content);
  logger.info(`PATCH request completed with status ${data.status}.`);

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});

function deleteHandler(req: Request) {
  return tracer.startActiveSpan("userDeleteHandler", (span: Span) => {
    let data: { status: number; content: any } = { status: -1, content: null };
    const userId = parseInt(req.params.id);
    const users = userService.getUsers()
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex !== -1) {
      const deletedUser = users.splice(userIndex, 1); // Remove the user from the array
      data = { status: 200, content: deletedUser };
      logger.info(`User deleted: ${JSON.stringify(deletedUser)}`);
    } else {
      data = { status: 404, content: "User not found" };
      logger.warn(`User with id ${userId} not found.`);
    }
    span.end();
    return data;
  });
}

userController.delete("/users/:id", (req, res) => {
  const histogram = meter.createHistogram("delete.users.duration");
  const startTime = new Date().getTime();

  totalRequestCounter.add(1);
  const data: { status: number; content: string } = deleteHandler(req);
  res.status(data.status).json(data.content);
  logger.info(`DELETE request completed with status ${data.status}.`);

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

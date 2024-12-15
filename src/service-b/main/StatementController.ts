import express, { Request, Response } from "express";
import { getLogger } from "../config/logger";
import { metrics, Span, trace } from "@opentelemetry/api";
import Statement from "../models/Statement";
import StatementService from "./StatementService";

const StatementController = express.Router();
const logger = getLogger();
const tracer = trace.getTracer("service-b");

const meter = metrics.getMeter("service-b");
const totalRequestCounter = meter.createCounter("total-request.counter");

const statementService = StatementService.getInstance();

// GET: Retrieve all statements
StatementController.get("/statements", async (req, res) => {
  const histogram = meter.createHistogram("get.statements.duration");
  const startTime = new Date().getTime();

  totalRequestCounter.add(1);
  logger.info("Fetching all statements.");
  const statements = await statementService.getStatements();
  res.json(statements);

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});

// POST: Add a new statement
StatementController.post("/statements", async (req, res) => {
  const histogram = meter.createHistogram("post.statements.duration");
  const startTime = new Date().getTime();
  totalRequestCounter.add(1);
  
  const statements = await statementService.createStatement(req.body as Statement);
  res.status(200).json(statements);
  logger.info("statement successfully added.");

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});

// PUT: Replace an existing statement by id
StatementController.put("/statements/:id", async (req, res) => {
  const histogram = meter.createHistogram("put.statements.duration");
  const startTime = new Date().getTime();

  totalRequestCounter.add(1);
  const newstatement = await statementService.updateStatement(req.body as Statement);
  res.status(200).json(newstatement);
  logger.info(`PUT request completed with status 200.`);

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});

// PATCH: Partially update a statement by id
StatementController.patch("/statements/:id", async (req, res) => {
  const histogram = meter.createHistogram("patch.statements.duration");
  const startTime = new Date().getTime();

  totalRequestCounter.add(1);
  const newstatement = await statementService.updateStatement(req.body as Statement);
  res.status(200).json(newstatement);
  logger.info(`PATCH request completed with status 200.`);

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});

StatementController.delete("/statements/:id", async (req, res) => {
  const histogram = meter.createHistogram("delete.statements.duration");
  const startTime = new Date().getTime();

  totalRequestCounter.add(1);
  const deletedstatement = statementService.deleteStatement(req.body as Statement);
  res.status(200).json(deletedstatement);
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

StatementController.get("/error", (req, res) => {
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

export default StatementController;

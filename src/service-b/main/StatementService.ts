import {
  Counter,
  Meter,
  metrics,
  Span,
  trace,
  Tracer,
} from "@opentelemetry/api";
import { getLogger } from "../config/logger";
import Statement from "../models/Statement";
import StatementDao from "./StatementDao";
import { Logger } from "winston";

export default class StatementService {
  private static instance: StatementService | undefined;
  private logger: Logger;
  private tracer: Tracer;
  private meter: Meter;
  private totalRequestCounter: Counter;
  private statementDao = StatementDao.getInstance();
  constructor() {
    this.logger = getLogger();
    this.tracer = trace.getTracer("service-b");
    this.meter = metrics.getMeter("service-b");
    this.totalRequestCounter = this.meter.createCounter("total-calls.counter");
  }

  static getInstance() {
    if (this.instance == undefined) {
      this.instance = new StatementService();
    }
    return this.instance;
  }

  getStatements() {
    return this.tracer.startActiveSpan("getStatements", async (span: Span) => {
      const statements = await this.statementDao.getStatements();
      span.end();
      return statements;
    });
  }

  getStatementById(id: number) {
    return this.tracer.startActiveSpan("getStatementById", async (span: Span) => {
      const statements = await this.statementDao.getStatementById(id);
      span.end();
      return statements;
    });
  }

  createStatement(statement: Statement) {
    return this.tracer.startActiveSpan("createStatement", async (span: Span) => {
      const statements = await this.statementDao.createStatement(statement);
      span.end();
      return statements;
    });
  }

  updateStatement(newStatement: Statement) {
    return this.tracer.startActiveSpan("updateStatement", async (span: Span) => {
      await this.statementDao.updateStatement(newStatement);
      span.end();
    });
  }

  deleteStatement(statement: Statement) {
    return this.tracer.startActiveSpan("deleteStatement", async (span: Span) => {
      await this.statementDao.deleteStatement(statement);
      span.end();
    });
  }
}

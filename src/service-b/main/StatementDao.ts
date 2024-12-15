import {
  Counter,
  Meter,
  metrics,
  Span,
  trace,
  Tracer,
} from "@opentelemetry/api";
import Statement from "../models/Statement";
import { getLogger } from "../config/logger";
import { Logger } from "winston";
import connection from "../config/mysql";

export default class StatementDao {
  private logger: Logger;
  private tracer: Tracer;
  private meter: Meter;
  private totalRequestCounter: Counter;
  private static instance: StatementDao | undefined;

  constructor() {
    this.logger = getLogger();
    this.tracer = trace.getTracer("service-b");
    this.meter = metrics.getMeter("service-b");
    this.totalRequestCounter = this.meter.createCounter("total-calls.counter");
  }

  static getInstance() {
    if (this.instance == undefined) {
      this.instance = new StatementDao();
    }
    return this.instance;
  }

  async getStatements() {
    return this.tracer.startActiveSpan("getStatements", (span: Span) => {
      const statementArray: Statement[] = [];
      connection.query("SELECT * FROM statement", (err: Error, results: Statement[]) => {
        if (err) {
          this.logger.error(err.stack);
          return;
        }
        results.forEach((value: Statement) => {
          statementArray.push(value);
        });
      });
      span.end();
      return statementArray;
    });
  }

  async getStatementById(id: number) {
    return this.tracer.startActiveSpan("getStatementById", (span: Span) => {
      const statementArray: Statement[] = [];
      connection.query(
        `SELECT * FROM statement WHERE id=${id}`,
        (err: Error, results: Statement[]) => {
          if (err) {
            this.logger.error(err.stack);
            return;
          }
          results.forEach((value: Statement) => {
            statementArray.push(value);
          });
        }
      );
      span.end();
      return statementArray[0];
    });
  }

  async createStatement(statement: Statement) {
    return this.tracer.startActiveSpan("createStatement", (span: Span) => {
      var result;
      connection.query(
        `INSERT INTO statement (userId, value) VALUES (${statement.userId}, ${statement.value})`,
        (err: Error, results: Statement[]) => {
          if (err) {
            this.logger.error(err.stack);
            return;
          }
          result = results;
        }
      );
      span.end();
      return result;
    });
  }

  async updateStatement(statement: Statement) {
    return this.tracer.startActiveSpan("updateStatement", (span: Span) => {
      var result;
      connection.query(
        `UPDATE statement SET userId = ${statement.userId}, value = ${statement.value} WHERE id = ${statement.id}`,
        (err, results) => {
          if (err) {
            this.logger.error(err.stack);
            return;
          }
          result = results;
        }
      );
      span.end();
      return result;
    });
  }

  async deleteStatement(statement: Statement) {
    return this.tracer.startActiveSpan("deleteStatement", (span: Span) => {
      var result;
      connection.query(
        `DELETE FROM statement WHERE id = ${statement.id}`,
        (err, results) => {
          if (err) {
            this.logger.error(err.stack);
            return;
          }
          result = results;
        }
      );
      span.end();
      return result;
    });
  }
}

import {
  Counter,
  Meter,
  metrics,
  Span,
  trace,
  Tracer,
} from "@opentelemetry/api";
import User from "../models/User";
import { getLogger } from "../config/logger";
import { Logger } from "winston";
import connection from "../config/mysql";

export default class UserDao {
  private logger: Logger;
  private tracer: Tracer;
  private meter: Meter;
  private totalRequestCounter: Counter;
  private static instance: UserDao | undefined;

  constructor() {
    this.logger = getLogger();
    this.tracer = trace.getTracer("service-a");
    this.meter = metrics.getMeter("service-a");
    this.totalRequestCounter = this.meter.createCounter("total-calls.counter");
  }

  static getInstance() {
    if (this.instance == undefined) {
      this.instance = new UserDao();
    }
    return this.instance;
  }

  async getUsers() {
    return this.tracer.startActiveSpan("getUsers", (span: Span) => {
      const userArray: User[] = [];
      connection.query("SELECT * FROM user", (err: Error, results: User[]) => {
        if (err) {
          this.logger.error(err.stack);
          return;
        }
        results.forEach((value: User) => {
          userArray.push(value);
        });
      });
      span.end();
      return userArray;
    });
  }

  async getUserById(id: number) {
    return this.tracer.startActiveSpan("getUserById", (span: Span) => {
      const userArray: User[] = [];
      connection.query(
        `SELECT * FROM user WHERE id=${id}`,
        (err: Error, results: User[]) => {
          if (err) {
            this.logger.error(err.stack);
            return;
          }
          results.forEach((value: User) => {
            userArray.push(value);
          });
        }
      );
      span.end();
      return userArray[0];
    });
  }

  async createUser(user: User) {
    return this.tracer.startActiveSpan("createUser", (span: Span) => {
      var result;
      connection.query(
        `INSERT INTO user (name, surname) VALUES (${user.name}, ${user.surname})`,
        (err: Error, results: User[]) => {
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

  async updateUser(user: User) {
    return this.tracer.startActiveSpan("updateUser", (span: Span) => {
      var result;
      connection.query(
        `UPDATE user SET name = ${user.name}, surname = ${user.surname} WHERE id = ${user.id}`,
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

  async deleteUser(user: User) {
    return this.tracer.startActiveSpan("deleteUser", (span: Span) => {
      var result;
      connection.query(
        `DELETE FROM user WHERE id = ${user.id}`,
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

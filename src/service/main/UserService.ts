import {
  Counter,
  Meter,
  metrics,
  Span,
  trace,
  Tracer,
} from "@opentelemetry/api";
import { getLogger } from "../config/logger";
import User from "../models/User";
import UserDao from "./UserDao";
import { Logger } from "winston";

export default class UserService {
  private static instance: UserService | undefined;
  private logger: Logger;
  private tracer: Tracer;
  private meter: Meter;
  private totalRequestCounter: Counter;
  private userDao = UserDao.getInstance();
  constructor() {
    this.logger = getLogger();
    this.tracer = trace.getTracer("service-a");
    this.meter = metrics.getMeter("service-a");
    this.totalRequestCounter = this.meter.createCounter("total-calls.counter");
  }

  static getInstance() {
    if (this.instance == undefined) {
      this.instance = new UserService();
    }
    return this.instance;
  }

  getUsers() {
    return this.tracer.startActiveSpan("getUsers", async (span: Span) => {
      const users = await this.userDao.getUsers();
      span.end();
      return users;
    });
  }

  getUserById(id: number) {
    return this.tracer.startActiveSpan("getUserById", async (span: Span) => {
      const users = await this.userDao.getUserById(id);
      span.end();
      return users;
    });
  }

  createUser(user: User) {
    return this.tracer.startActiveSpan("createUser", async (span: Span) => {
      const users = await this.userDao.createUser(user);
      span.end();
      return users;
    });
  }

  updateUser(newUser: User) {
    return this.tracer.startActiveSpan("updateUser", async (span: Span) => {
      await this.userDao.updateUser(newUser);
      span.end();
    });
  }

  deleteUser(user: User) {
    return this.tracer.startActiveSpan("deleteUser", async (span: Span) => {
      await this.userDao.deleteUser(user);
      span.end();
    });
  }
}

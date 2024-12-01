import {
  Counter,
  Meter,
  metrics,
  Span,
  trace,
  Tracer,
} from "@opentelemetry/api";
import { getLogger } from "./logger";
import User from "./User";
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
    this.tracer = trace.getTracer("user dao");
    this.meter = metrics.getMeter("user dao");
    this.totalRequestCounter = this.meter.createCounter("total-calls.counter");
  }

  static getInstance() {
    if (this.instance == undefined) {
      this.instance = new UserService();
    }
    return this.instance;
  }

  getUsers(): User[] {
    return this.tracer.startActiveSpan("getUsers", (span: Span) => {
      const users = this.userDao.getUsers();
      span.end();
      return users;
    });
  }

  updateUsers(newUsers: User[]) {
    return this.tracer.startActiveSpan("updateUsers", (span: Span) => {
      this.userDao.updateUsers(newUsers);
      span.end();
    });
  }
}

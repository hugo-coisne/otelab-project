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

  private users: User[] = [
    {
      id: 1,
      name: "hugo",
      surname: "coisne",
    },
    {
      id: 2,
      name: "leo",
      surname: "saintier",
    },
    {
      id: 3,
      name: "fabio",
      surname: "petrillo",
    },
  ];

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

  getUsers() {
    return this.tracer.startActiveSpan("getUsers", (span: Span) => {
      span.end();
      return this.users;
    });
  }

  updateUsers(newUsers: User[]) {
    return this.tracer.startActiveSpan("updateUsers", (span: Span) => {
      this.users = newUsers;
      span.end();
    });
  }
}

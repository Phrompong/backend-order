import "reflect-metadata";
import { injectable } from "inversify";
import winston, { format } from "winston";
import {
  ElasticsearchTransport,
  ElasticsearchTransformer,
} from "winston-elasticsearch";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { name, version } = require("../../package.json");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import container from "../inversify.config";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TYPES } from "../types";

import IState from "../interfaces/state.interface";

@injectable()
export default class State implements IState {
  logger: winston.Logger;

  constructor() {
    const { colorize } = winston.format;
    const timestampFormat = format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    });

    /* istanbul ignore next */
    const printfFormat = format.printf(
      (info) =>
        `${info.timestamp} [${process.pid}] ${info.level}: ${info.message}`
    );

    const consoleFormat =
      process.env.NODE_ENV === "production"
        ? /* istanbul ignore next */ format.combine(
            timestampFormat,
            printfFormat
          )
        : format.combine(colorize(), timestampFormat, printfFormat);

    const transports: winston.transport[] = [];

    /* istanbul ignore else */
    if (process.env.NODE_ENV === "test") {
      transports.push(
        new winston.transports.File({ filename: "./logs/tests.log" })
      );
    }

    /* istanbul ignore if */
    if (process.env.NODE_ENV === "development") {
      // * Add console transport
      transports.push(
        new winston.transports.Console({
          format: consoleFormat,
          handleExceptions: true,
        })
      );
    }

    /* istanbul ignore if */
    if (process.env.NODE_ENV === "production") {
      // * Add console transport
      transports.push(
        new winston.transports.Console({
          format: consoleFormat,
          handleExceptions: true,
        })
      );
    }

    this.logger = winston.createLogger({
      exitOnError: true,
      transports,
    });

    // Compulsory error handling
    /* istanbul ignore next */
    this.logger.on("error", (error) => {
      // eslint-disable-next-line no-console
      console.error("Logger error", error);
    });
  }

  async init(): Promise<void> {
    this.logger.info("Initializing");
    // Init
  }
}

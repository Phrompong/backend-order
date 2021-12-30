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

      // * Add elasticsearch transport
      const index = `logs-pttdigital-${name.replace(
        "pttdigital.pos.oil.",
        ""
      )}`;

      const esTransport = new ElasticsearchTransport({
        level: "info",
        clientOpts: {
          node: process.env.ELASTICSEARCH_URI,
          auth: {
            username: process.env.ELASTICSEARCH_USERNAME || "",
            password: process.env.ELASTICSEARCH_PASSWORD || "",
          },
        },
        index,
        indexPrefix: name,
        dataStream: true,
        transformer: (logData) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const transformed = ElasticsearchTransformer(logData) as any;
          transformed["@version"] = version;
          transformed["pid"] = process.pid;
          transformed["kubernetes.pod.name"] = process.env.K8S_POD_NAME || "";
          return transformed;
        },
        indexTemplate: {
          priority: 200,
          template: {
            settings: {
              index: {
                mapping: {
                  total_fields: {
                    limit: "3000",
                  },
                },
                refresh_interval: "5s",
                number_of_shards: "1",
                number_of_replicas: "0",
              },
            },
            mappings: {
              _source: {
                enabled: true,
              },
              properties: {
                severity: {
                  index: true,
                  type: "keyword",
                },
                source: {
                  index: true,
                  type: "keyword",
                },
                "@timestamp": {
                  type: "date",
                },
                "@version": {
                  type: "keyword",
                },
                fields: {
                  dynamic: true,
                  type: "object",
                },
                message: {
                  index: true,
                  type: "text",
                },
                "kubernetes.pod.name": {
                  index: true,
                  type: "text",
                },
                pid: {
                  index: true,
                  type: "int",
                },
              },
            },
          },
          index_patterns: [`${index}*`],
          data_stream: {},
          composed_of: [],
        },
      });

      esTransport.on("error", (error) => {
        // eslint-disable-next-line no-console
        console.error("Logger error", error);
      });

      transports.push(esTransport);
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

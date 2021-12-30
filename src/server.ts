// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv-safe").config();
import { expressMiddleware } from "responsio";
import cluster from "cluster";
import os from "os";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { connect, connection } from "mongoose";
import container from "./inversify.config";
import IState from "./interfaces/state.interface";
import { TYPES } from "./types";
import routers from "./routes";
import healthCheckRouter from "./routes/healthCheck.route";
import { serverStoppingHelper, stoppingFunction } from "./gracefulShutdown";
import { Server } from "http";

const bodyParser = require("body-parser");
const appEnv = process.env.NODE_ENV || /* istanbul ignore next */ "development";

let state: IState;
let server: Server;
const app = express();

/* istanbul ignore if */
if (cluster.isMaster && appEnv !== "test") {
  // * Get current cpu count
  const numCPUs = os.cpus().length;

  // eslint-disable-next-line no-console
  console.log(`Master ${process.pid} started`);
  const maxClusters = Number(process.env.MAX_CLUSTERS || 1);

  const clusters = +numCPUs > maxClusters ? maxClusters : +numCPUs;
  let workers: cluster.Worker[] = [];

  // * Fork workers
  for (let i = 0; i < (appEnv === "production" ? clusters : 1); i++) {
    workers.push(cluster.fork());
  }

  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, () => {
      // eslint-disable-next-line no-console
      console.log(`Received signal: ${signal}`);
      workers.forEach((worker) => {
        worker.send("stopApp");
      });
    });
  });

  cluster.on("exit", (worker: cluster.Worker) => {
    // eslint-disable-next-line no-console
    console.log(`Worker ${worker.process.pid} died`);

    workers = workers.filter((w) => w.process.pid !== worker.process.pid);

    if (workers.length === 0) {
      process.exit();
    }
  });
} else {
  // * Init application
  init();
}

async function connectToDatabase(): Promise<void> {
  try {
    const constr = process.env.CONNECTION_STRING;
    const dbName = process.env.DATABASE_NAME;

    /* istanbul ignore if */
    if (!constr) {
      throw new Error("Connection string is missing");
    }

    /* istanbul ignore if */
    if (!dbName) {
      throw new Error("Database name is missing");
    }

    state.logger.info(`Connecting to database...`);

    await connect(constr, {
      dbName,
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    state.logger.info(`Database connected`);
  } catch (error) /* istanbul ignore next */ {
    if (error instanceof Error) {
      state.logger.error(`Can't connect to database: ${error.message}`);
    }

    throw error;
  }
}

async function init() {
  // * Spin up States
  state = container.get<IState>(TYPES.State);

  state
    .init()
    // .then(connectToDatabase)
    .then(() => {
      app.use(helmet());
      app.use(cors());
      app.use(expressMiddleware());
      app.use(express.text({ type: "text/plain" }));
      app.use("/healthCheck", healthCheckRouter);
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json());
      // app.use(validateToken(process.env.SECRET));
      app.use("/api", routers);

      server = app.listen(process.env.PORT, () => {
        serverStoppingHelper(server);
        state.logger.info(`Server running on ${process.env.PORT}`);
        app.emit("appStarted", app);
      });

      // * Loop and listen to each signals
      process.on("message", (message) => {
        /* istanbul ignore if */
        if (message !== "stopApp") {
          return;
        }

        state.logger.info("Gracefully shutting down");

        // * Start stopping current connections
        stoppingFunction().then(() => {
          app.emit("appStopping", "stop");

          /* istanbul ignore else */
          if (process.env.NODE_ENV === "test") return;

          /* istanbul ignore next */
          close();
        });
      });
    })
    .catch(
      /* istanbul ignore next */ (err) => {
        state.logger.error(err);
      }
    );
}

/* istanbul ignore next */
async function close() {
  server.close(() => {
    state.logger.info("Closed HTTP server");

    // * Close Mongo connection
    /* istanbul ignore next */
    connection
      .close()
      .then(() => {
        state.logger.info("Closed database connection");

        // * Close other dependecies if exist

        state.logger.end(() => {
          process.exit();
        });
      })
      .catch((err) => {
        state.logger.error("Unable to close database connection", err);
      });
  });
}

export default app;

require("dotenv-safe").config();
import cors from "cors";
import { expressMiddleware } from "responsio";
import routers from "./routes";
import container from "./inversify.config";
import IState from "./interfaces/state.interface";
import { TYPES } from "./types";
import { connect } from "mongoose";
import commonController from "./controllers/common.controller";

const https = require("https");
const express = require("express");
const bodyParser = require("body-parser");
const state = container.get<IState>(TYPES.State);
const app = express();
const fs = require("fs");

async function connectToDatabase(): Promise<void> {
  try {
    const constr = process.env.CONNECTION_STRING;
    const dbName = process.env.DATABASE_NAME;

    if (!constr) {
      throw new Error("Connection string is missing");
    }

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
  } catch (error) {
    if (error instanceof Error) {
      state.logger.error(`Can't connect to database: ${error.message}`);
    }

    throw error;
  }
}

init();

async function init() {
  var app = express();
  app.use(cors());
  app.use(expressMiddleware());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.get("/healthCheck", (req: any, res: any) => {
    res.send("ok");
  });
  app.use("/api", routers);

  // * connect database mongoDB
  await connectToDatabase();

  const port = process.env.PORT || 443;
  const server = https.createServer(
    // {
    //   cert: fs.readFileSync("../../../etc/httpd/ssl/134_209_108_248.crt"),
    //   key: fs.readFileSync("../../../etc/httpd/ssl/private.key"),
    //   ca: fs.readFileSync("../../../etc/httpd/ssl/CARootCertificate-ca.crt"),
    // },
    app
  );

  server.listen(port, async () => {
    //await commonController.convertMessage("");
    state.logger.info(`server runnun : ${port}`);
  });
}

export default app;

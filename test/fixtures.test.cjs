require("dotenv-safe").config();
const { GenericContainer } = require("testcontainers");

let container;

function startServer() {
  return new Promise((resolve, reject) => {
    require("../src/server.ts").default.on("appStarted", (arg) => {
      resolve(arg);
    });
  });
}
// Redis container

// RabbitMQ container

// MongoDB container
async function startMongoServer() {
  global.mongoContainer = await new GenericContainer("mongo:4.4.2")
    .withExposedPorts(27017)
    .start();

  global.mongoUrl = `mongodb://127.0.0.1:${global.mongoContainer.getMappedPort(
    27017
  )}`;

  process.env.CONNECTION_STRING = global.mongoUrl;
}

exports.mochaGlobalSetup = async function () {
  global.mongoUrl = process.env.CONNECTION_STRING;
  process.env.DATABASE_NAME = "HORIZON_TEST";

  // ! Can comment this line when developing
  await startMongoServer();
  // await startRedis();
  // await startRabbitMQ();
  let server = await startServer();
  global.server = server;
  console.log("server running");
};

exports.mochaGlobalTeardown = async function () {
  if (global.mongoContainer) await global.mongoContainer.stop();
};

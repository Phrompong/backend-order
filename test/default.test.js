import assert from "assert";
import * as http from "http";
var axios = require("axios");
const {
  setForceTimeout,
  setIdleTimeout,
  stoppingFunction,
  reqCountPerSocket,
} = require("../src/gracefulShutdown");

const url = `http://localhost:${process.env.PORT}`;

/**
 * Default test cases do not delete or modify
 */
describe("Default test cases", () => {
  describe("/GET healthCheck", () => {
    it("should have healthCheck", async () => {
      await assert.doesNotReject(axios.get(`${url}/healthCheck`));
    });
  });

  describe("Graceful Shutdowns", () => {
    it("should not have connection after finish request", (done) => {
      axios.get(`${url}/healthCheck`).then((res) => {
        setTimeout(() => {
          assert.strictEqual(reqCountPerSocket.size, 0);
          done();
        }, 100);
      });
    });

    it("should still have connection when given connection:keep-alive", (done) => {
      axios
        .get(`${url}/healthCheck`, {
          httpAgent: new http.Agent({ keepAlive: true }),
        })
        .then((res) => {
          setTimeout(() => {
            assert.strictEqual(reqCountPerSocket.size, 1);
            done();
          }, 100);
        });
    });

    it("should terminate processs when sent message: stopApp", (done) => {
      global.server.once("appStopping", function (signal) {
        done();
      });
      process.emit("message", "stopApp");
    });

    it("should terminate keep-alive connections", (done) => {
      axios
        .get(`${url}/healthCheck`, {
          httpAgent: new http.Agent({ keepAlive: true }),
        })
        .then((res) => {
          console.log("connection header", res.headers.connection);
          done();
        });

      setIdleTimeout(100);
      setForceTimeout(1800);

      // * Run only to trigger terminating
      stoppingFunction();
    });

    it("should force close the connection when forceTimeout is reached", (done) => {
      axios
        .get(`${url}/healthCheck?timeout=5000`)
        .then(() => {
          done(new Error("Should had hung up"));
        })
        .catch((err) => {
          assert.strictEqual(err.code, "ECONNRESET");
          assert.strictEqual(err.message, "socket hang up");
          done();
        });

      // * Must set forceTimeout to be quick. To fire before request is finished
      setIdleTimeout(10);
      setForceTimeout(20);

      stoppingFunction();
    });
  });
});

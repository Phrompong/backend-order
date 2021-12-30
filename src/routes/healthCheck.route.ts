// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require("../../package.json");
import express from "express";

const router = express.Router();

router.get("/", (_req, res) => {
  const { timeout } = _req.query;
  let ms = 0;

  // * Only allow timeout on test
  /* istanbul ignore else */
  if (process.env.NODE_ENV === "test") {
    ms = +(timeout || 0);
  }

  setTimeout(() => {
    res.status(200).respond(0, "ok", { version });
  }, ms);
});

export default router;

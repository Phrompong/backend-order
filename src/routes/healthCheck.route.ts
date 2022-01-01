// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require("../../package.json");
import express from "express";
const path = require("path");
const fs = require("fs");
const router = express.Router();

router.get("/", async (_req, res) => {
  res.status(200).respond(0, "Success", "ok");
});

export default router;

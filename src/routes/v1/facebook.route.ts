import facebookController from "../../controllers/facebook.controller";
import express from "express";
import container from "../../inversify.config";
import IState from "../../interfaces/state.interface";
import { TYPES } from "../../types";

var router = express.Router();

const VERIFY_TOKEN = "manGriveUpToken";
const { get } = require("lodash");
const request = require("request");
const state = container.get<IState>(TYPES.State);

router.get("/manGiveup/webhook", async (req, res) => {
  // Parse the query params
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.send(challenge);
  } else {
    state.logger.error("WEBHOOK_VERIFIED");
    res.sendStatus(403);
  }
});

// * verfify success
router.post("/manGiveup/webhook", async (req, res) => {
  try {
    const page = "manGiveup";
    let { body } = req;
    console.log(`+++++ ${page} +++++`);
    console.log(`[Man giveup] : ${body.entry[0].messaging[0].message.text}`);

    const message = body.entry[0].messaging[0].message.text;
    const sender = body.entry[0].messaging[0].sender.id;

    if (body.object === "page") {
      const events = body && body.entry && body.entry[0];

      await facebookController.sendMessage(sender, message, page);
      console.log(`+++++ end +++++`);
      return res.sendStatus(200);
    }

    console.log(`+++++ end (err) +++++`);
    return res.sendStatus(400);
  } catch (error) {
    const err = error as Error;
    console.log(`[webhook] : ${err.message}`);
    return;
  }
});

export default router;

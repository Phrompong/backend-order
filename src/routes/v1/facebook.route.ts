import express from "express";

var router = express.Router();

const PAGE_ACCESS_TOKEN =
  "EAAGY2AVZAy2cBAOZCOfiuESDMZAmRdHaAx2TpMH7DVHrmCULhvYkOArzlahVvXo5G7nKczv0ZCcTuBLybkC2mG4AXujkovuENMsBOWKnmku1zNAPjoIokNkZAM7DTTgjvYvnoT231ZAHm59PJZCNdXhXSyr3RA00cZBgBva6ZBFD2NJ45JkW18CvZB";
const VERIFY_TOKEN = "chatv3";
const { get } = require("lodash");
const request = require("request");

router.get("/webhook", async (req, res) => {
  // Parse the query params
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.send(challenge);
  } else {
    // Responds with '403 Forbidden' if verify tokens do not match
    console.log("WEBHOOK_VERIFIED");
    res.sendStatus(403);
  }
});

const handleEvents = (events: any) => {
  const text = get(events, ["messaging", 0, "message", "text"]);
  const sender = get(events, ["messaging", 0, "sender", "id"]);
  const requestBody = {
    messaging_type: "RESPONSE",
    recipient: {
      id: sender,
    },
    message: { text },
  };

  if (!text) {
    console.log("text is empty");
    return;
  }

  console.log("message : " + text);

  const config = {
    method: "post",
    uri: "https://graph.facebook.com/v6.0/me/messages",
    json: requestBody,
    qs: {
      access_token: `${PAGE_ACCESS_TOKEN}`,
    },
  };
  return request(config, (er: any, res: any, body: any) => {
    if (!body.error) {
      console.log("message sent!", body);
      return body;
    } else {
      console.log(body.error);
      return new Error("Unable to send message:" + body.error);
    }
  });
};

router.post("/webhook", async (req, res) => {
  console.log("starting webhook");
  let { body } = req;

  if (body.object === "page") {
    const events = body && body.entry && body.entry[0];
    console.log("event " + JSON.stringify(events));

    body = undefined;
    await handleEvents(events);
  } else {
    console.log("bodu :" + body);
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

  return res.sendStatus(200);
  return;
});

export default router;

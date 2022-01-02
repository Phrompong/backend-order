import { transactionModel } from "../models/trasaction.model";
import commonController from "./common.controller";
import container from "../inversify.config";
import IState from "../interfaces/state.interface";
import { TYPES } from "../types";

const { get } = require("lodash");
const request = require("request");
const state = container.get<IState>(TYPES.State);

const data =
  "กรุณากรอกข้อมูลต่อไปนี้เพื่อสั่งซื้อสินค้า \r" +
  "ชื่อรุ่น:\r" +
  "คุณสมบัติ:\r" +
  "สี:\r" +
  "จำนวน:\r" +
  "โอน:\r" +
  "จำนวนเงิน:\r" +
  "ชื่อผู้สั่ง:\r" +
  "ที่อยู่:\r" +
  "เบอร์:\r " +
  "แอดมิน:\r";
const PAGE_ACCESS_TOKEN =
  "EAAEhLR6SuJEBAMQf4MvDjwZB0MTyt254HaBniKGLMZBO9bF3ZBOZBpwjTPgNNEHCIdADruOXPx3dlwsUPpT0zpYefa0JCXgynn6ZAyDbUX8JUZAVnZCYKg391V0Fp07et6IWsKhnylMH0ZCL5ZC3rrn2YNeJlURfZBGTzdnJWUeDJR8kI1HfZCQaEiFYUZCAm5C7XqgZD";

async function forVerify(events: any) {
  try {
    const text = get(events, ["messaging", 0, "message", "text"]);
    const sender = get(events, ["messaging", 0, "sender", "id"]);

    const requestBody = {
      messaging_type: "RESPONSE",
      recipient: {
        id: sender,
      },
      message: { text },
    };

    if (requestBody.message.text === "1") {
      requestBody.message.text = "Thank you for order ball 10 bath";
    } else if (requestBody.message.text === "2") {
      requestBody.message.text = "Thank you for order iphone 10000 bath";
    } else {
      requestBody.message.text =
        "Please select no 1)buy ball 10 bath,2)buy iphone 10000 bath";
    }

    const config = {
      method: "post",
      uri: "https://graph.facebook.com/v6.0/me/messages",
      json: requestBody,
      qs: {
        access_token: `${PAGE_ACCESS_TOKEN}`,
      },
    };

    console.log(JSON.stringify(config));

    return request(config, (err: any, res: any, body: any) => {
      if (!body.error) {
        console.log("message sent!", body);
        return body;
      } else {
        return new Error("Unable to send message:" + body.error);
      }
    });
  } catch (error) {
    const err = error as Error;
    console.log(err.message);
    return;
  }
}

async function sendMessage(sender: string, text: string) {
  try {
    if (!text) {
      state.logger.info(`[sendMessage] : text is missing`);
      return;
    }

    // * keyword for check confirm order
    const check = text.search("สรุปรายการสั่งซื้อ");

    if (check !== -1) {
      const data = await commonController.convertMessage(text);

      await transactionModel.create(data);

      state.logger.info(
        `[sendMessage] : save suucess : ${JSON.stringify(data)}`
      );

      //#region body for send to facebook
      // const requestBody = {
      //   messaging_type: "RESPONSE",
      //   recipient: {
      //     id: sender,
      //   },
      //   message: { text },
      // };
      //#endregion

      //#region for sending to messagers
      // requestBody.message.text = "Save success";

      // const config = {
      //   method: "post",
      //   uri: "https://graph.facebook.com/v6.0/me/messages",
      //   json: requestBody,
      //   qs: {
      //     access_token: `${process.env.PAGE_ACCESS_TOKEN}`,
      //   },
      // };

      // return request(config, (er: any, res: any, body: any) => {
      //   if (!body.error) {
      //     console.log("message sent!", body);
      //     return body;
      //   } else {
      //     console.log(body.error);
      //     return new Error("Unable to send message:" + body.error);
      //   }
      // });
      //#endregion
    }

    return;
  } catch (error) {
    const err = error as Error;
    console.log(err.message);
    return;
  }
}

export default {
  sendMessage,
  forVerify,
};

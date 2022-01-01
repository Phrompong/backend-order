import { transactionModel } from "../models/trasaction.model";
import commonController from "./common.controller";

const { get } = require("lodash");
const request = require("request");

const data =
  "กรุณากรอกข้อมูลต่อไปนี้เพื่อสั่งซื้อสินค้า \r" +
  "ชื่อรุ่น:  \r" +
  "คุณสมบัติ:  \r" +
  "สี:  \r" +
  "จำนวน:  \r" +
  "(โอน.COD):  \r" +
  "จำนวนเงิน:  \r" +
  "ชื่อผู้สั่ง:  \r" +
  "ที่อยู่:  \r" +
  "เบอร์:  \r " +
  "แอดมิน:  \r";

export async function sendMessage(events: any) {
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

  const bodyText = requestBody.message.text;

  const check = bodyText.search("กรุณากรอกข้อมูลต่อไปนี้เพื่อสั่งซื้อสินค้า");

  if (check === -1) {
    requestBody.message.text = data;
  } else {
    requestBody.message.text = "Thank you for order";
    const data = await commonController.convertMessage(bodyText);
    console.log(JSON.stringify(data));

    await transactionModel.create(data);
  }

  const config = {
    method: "post",
    uri: "https://graph.facebook.com/v6.0/me/messages",
    json: requestBody,
    qs: {
      access_token: `${process.env.PAGE_ACCESS_TOKEN}`,
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
}

export default {
  sendMessage,
};

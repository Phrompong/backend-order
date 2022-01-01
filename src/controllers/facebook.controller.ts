const { get } = require("lodash");
const request = require("request");

const data =
  "สรุปรายการสั่งซื้อ \r" +
  "ชื่อรุ่น ไฟแชีคกระสุน" +
  "คุณสมบัติ จุดไฟ" +
  "สี ทอง" +
  "จำนวน 1" +
  "(โอน.COD) COD" +
  "จำนวนเงิน 209" +
  "ชื่อผู้สั่ง นายพร้อมพงศ์ แขกเทศ" +
  "ที่อยู่ Britania lumluka" +
  "เบอร์ 9999999" +
  "แอดมิน ชอป";

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

  const check = bodyText.search("สรุปรายการสั่งซื้อ");

  if (check === -1) {
    requestBody.message.text = data;
  } else {
    requestBody.message.text = "Thank you for order";
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

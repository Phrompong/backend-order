import { transaction } from "../models/trasaction.model";
import container from "../inversify.config";
import IState from "../interfaces/state.interface";
import { TYPES } from "../types";

let state: IState;
const test =
  "สรุปรายการสั่งซื้อ\r" +
  "ชื่อเพจ:test\r" +
  "ชื่อรุ่น:test\r" +
  "คุณสมบัติ:test\r" +
  "สี:test\r" +
  "จำนวน:1\r" +
  "โอน:test\r" +
  "จำนวนเงิน:200\r" +
  "ชื่อผู้สั่ง:test\r" +
  "ที่อยู่:test\r" +
  "เบอร์:test\r " +
  "แอดมิน:test\r";

async function convertMessage(data: any): Promise<transaction> {
  state = container.get<IState>(TYPES.State);
  try {
    //#region init wording
    const page = data
      .substring(data.search("ชื่อเพจ:") + 9, data.search("ชื่อรุ่น:"))
      .trim();

    const model = data
      .substring(data.search("ชื่อรุ่น:") + 9, data.search("คุณสมบัติ:"))
      .trim();

    const property = data
      .substring(data.search("คุณสมบัติ:") + 10, data.search("สี:"))
      .trim();

    const color = data
      .substring(data.search("สี:") + 3, data.search("จำนวน:"))
      .trim();

    const num = data
      .substring(data.search("จำนวน:") + 6, data.search("โอน:"))
      .trim();

    const cod = data
      .substring(data.search("โอน:") + 4, data.search("จำนวนเงิน:"))
      .trim();

    const total = data
      .substring(data.search("จำนวนเงิน:") + 10, data.search("ชื่อผู้สั่ง:"))
      .trim();

    const name = data
      .substring(data.search("ชื่อผู้สั่ง:") + 12, data.search("ที่อยู่:"))
      .trim();

    const address = data
      .substring(data.search("ที่อยู่:") + 8, data.search("เบอร์:"))
      .trim();

    const tel = data
      .substring(data.search("เบอร์:") + 6, data.search("แอดมิน:"))
      .trim();

    const admin = data.substring(data.search("แอดมิน:") + 7);
    //#endregion

    const response: transaction = {
      page,
      model,
      property,
      color,
      num: +num,
      paymentType: cod,
      total: +total,
      name,
      address,
      tel,
      admin,
      createdDate: new Date(),
    };

    return response;
  } catch (error) {
    const err = error as Error;
    state.logger.error(`[convertMessage] : ${err.message}`);
    throw err;
  }
}

const dataTest =
  "สรุปรายการสั่งซื้อ\r" +
  "ชื่อรุ่น: S\r" +
  "ไซต์ :L\r" +
  "สี:test\r" +
  "จำนวน:3\r" +
  "วิธีการชำระเงิน:เก็บเงินปลายทาง\r" +
  "จำนวนเงิน:100\r" +
  "ชื่อผู้ซื้อ:สายยัน ขุดดอน\r" +
  "FB:Saiyan Khouddon\r" +
  "ที่อยู่:405/47 ม.ฟลอล่าวิลล เฟส 16  ซ.6 ซ.ฉลองกรุง 61 ถ.ฉลองกรุง แขวง ลำปลาทิว ข. ลาดกระบัง กรุงเทพ 10520\r" +
  "เบอร์:T. 0625260757\r " +
  "แอดมิน:nan\r";

async function convertMessagePageManGiveUp(manGiveUp: any): Promise<any> {
  try {
    const page = "Man giveup";

    //#region init wording
    const model = await initWording(manGiveUp, "ชื่อรุ่น", "ไซต์");

    const size = await initWording(manGiveUp, "ไซต์", "สี");

    const color = await initWording(manGiveUp, "สี", "จำนวน");

    const num = await initWording(manGiveUp, "จำนวน", "วิธีการชำระเงิน");

    const paymentType = await initWording(
      manGiveUp,
      "วิธีการชำระเงิน",
      "จำนวนเงิน"
    );

    const total = await initWording(manGiveUp, "จำนวนเงิน", "ชื่อผู้ซื้อ");

    const name = await initWording(manGiveUp, "ชื่อผู้ซื้อ", "FB");

    const facebook = await initWording(manGiveUp, "FB", "ที่อยู่");

    const address = await initWording(manGiveUp, "ที่อยู่", "เบอร์");

    const tel = await initWording(manGiveUp, "เบอร์", "แอดมิน");

    const admin = await initWording(manGiveUp, "แอดมิน", "");

    //#endregion

    const response: transaction = {
      model,
      page,
      size,
      color,
      num: +num,
      paymentType,
      total: +total,
      name,
      facebook,
      address,
      tel,
      admin,
    };

    return response;
  } catch (error) {
    const err = error as Error;
    console.log(err.message);
    throw error;
  }
}

async function initWording(data: any, fromWord: string, toWord: string) {
  try {
    let response;
    if (fromWord === "แอดมิน") {
      response = data
        .substring(data.search(fromWord) + fromWord.length)
        .trim()
        .slice(1)
        .trim();
    } else {
      response = data
        .substring(data.search(fromWord) + fromWord.length, data.search(toWord))
        .trim()
        .slice(1)
        .trim();
    }

    return response;
  } catch (error) {
    const err = error as Error;
    console.log(`[initWording] : ${err.message}`);
    throw err;
  }
}

export default {
  convertMessage,
  convertMessagePageManGiveUp,
};

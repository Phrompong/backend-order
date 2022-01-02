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

const manGiveUp =
  "สรุปรายการสั่งซื้อ\r" +
  "ชื่อรุ่น:S\r" +
  "ไซต์:L\r" +
  "สี:test\r" +
  "จำนวน:3\r" +
  "โอน:เก็บเงินปลายทาง\r" +
  "จำนวนเงิน:100\r" +
  "ชื่อ:สายยัน ขุดดอน\r" +
  "FB:Saiyan Khouddon\r" +
  "ที่อยู่:405/47 ม.ฟลอล่าวิลล เฟส 16  ซ.6 ซ.ฉลองกรุง 61 ถ.ฉลองกรุง แขวง ลำปลาทิว ข. ลาดกระบัง กรุงเทพ 10520\r" +
  "เบอร์:T. 0625260757\r " +
  "แอดมิน:nan\r";

async function convertMessagePageManGiveUp(data: any): Promise<any> {
  try {
    const page = "Man giveup";
    //#region init wording
    const model = manGiveUp
      .substring(
        manGiveUp.search("ชื่อรุ่น:") + "ชื่อรุ่น:".length,
        manGiveUp.search("ไซต์:")
      )
      .trim();

    const size = manGiveUp
      .substring(
        manGiveUp.search("ไซต์:") + "ไซต์:".length,
        manGiveUp.search("สี:")
      )
      .trim();

    const color = manGiveUp
      .substring(
        manGiveUp.search("สี:") + "สี:".length,
        manGiveUp.search("จำนวน:")
      )
      .trim();

    const num = manGiveUp
      .substring(
        manGiveUp.search("จำนวน:") + "จำนวน:".length,
        manGiveUp.search("โอน:")
      )
      .trim();

    const paymentType = manGiveUp
      .substring(
        manGiveUp.search("โอน:") + "โอน:".length,
        manGiveUp.search("จำนวนเงิน:")
      )
      .trim();

    const total = manGiveUp
      .substring(
        manGiveUp.search("จำนวนเงิน:") + "จำนวนเงิน:".length,
        manGiveUp.search("ชื่อ:")
      )
      .trim();

    const name = manGiveUp
      .substring(
        manGiveUp.search("ชื่อ:") + "ชื่อ:".length,
        manGiveUp.search("FB:")
      )
      .trim();

    const facebook = manGiveUp
      .substring(
        manGiveUp.search("FB:") + "FB:".length,
        manGiveUp.search("ที่อยู่:")
      )
      .trim();

    const address = manGiveUp
      .substring(
        manGiveUp.search("ที่อยู่:") + "ที่อยู่:".length,
        manGiveUp.search("เบอร์:")
      )
      .trim();

    const tel = manGiveUp
      .substring(
        manGiveUp.search("เบอร์:") + "เบอร์:".length,
        manGiveUp.search("แอดมิน:")
      )
      .trim();

    const admin = manGiveUp
      .substring(manGiveUp.search("แอดมิน:") + "แอดมิน:".length)
      .trim();

    //#endregion

    const response: transaction = {
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

export default {
  convertMessage,
  convertMessagePageManGiveUp,
};

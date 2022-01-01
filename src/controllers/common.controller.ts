import { transaction } from "../models/trasaction.model";
import container from "../inversify.config";
import IState from "../interfaces/state.interface";
import { TYPES } from "../types";

let state: IState;

const data =
  "สรุปรายการสั่งซื้อ" +
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

async function convertMessage(message: string): Promise<transaction> {
  state = container.get<IState>(TYPES.State);
  try {
    const model = data
      .substring(data.search("ชื่อรุ่น") + 8, data.search("คุณสมบัติ"))
      .trim();

    const property = data
      .substring(data.search("คุณสมบัติ") + 9, data.search("สี"))
      .trim();

    const color = data
      .substring(data.search("สี") + 3, data.search("จำนวน"))
      .trim();

    const num = data
      .substring(data.search("จำนวน") + 5, data.search("(โอน.COD)"))
      .trim()
      .split("(")[0];

    const cod = data
      .substring(data.search("(โอน.COD)") + 8, data.search("จำนวนเงิน"))
      .trim();

    const total = data
      .substring(data.search("จำนวนเงิน") + 9, data.search("ชื่อผู้สั่ง"))
      .trim();

    const name = data
      .substring(data.search("ชื่อผู้สั่ง") + 12, data.search("ที่อยู่"))
      .trim();

    const address = data
      .substring(data.search("ที่อยู่") + 7, data.search("เบอร์"))
      .trim();

    const tel = data
      .substring(data.search("เบอร์") + 5, data.search("แอดมิน"))
      .trim();

    const admin = data.substring(data.search("แอดมิน") + 7);

    const response: transaction = {
      model,
      property,
      color,
      num: +num,
      cod,
      total: +total,
      name,
      address,
      tel,
      admin,
    };

    return response;
  } catch (error) {
    const err = error as Error;
    state.logger.error(`[convertMessage] : ${err.message}`);
    throw err;
  }
}

export default {
  convertMessage,
};

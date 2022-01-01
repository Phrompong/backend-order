import { transaction } from "../models/trasaction.model";
import container from "../inversify.config";
import IState from "../interfaces/state.interface";
import { TYPES } from "../types";

let state: IState;
const test =
  "กรุณากรอกข้อมูลต่อไปนี้เพื่อสั่งซื้อสินค้า\r" +
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
      createdDate: new Date(),
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

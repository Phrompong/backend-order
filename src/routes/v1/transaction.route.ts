import express from "express";
import container from "../../inversify.config";
import IState from "../../interfaces/state.interface";
import { TYPES } from "../../types";
import { transactionModel } from "../../models/trasaction.model";

var router = express.Router();
const state = container.get<IState>(TYPES.State);

router.get("/", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let obj: any = {};
    if (startDate && endDate) {
      obj = {
        createdDate: {
          $gte: new Date(startDate as string),
          $lt: new Date(endDate as string),
        },
      };
    }

    res
      .status(200)
      .respond(0, "success", await transactionModel.find(obj).lean());

    return;
  } catch (error) {
    const err = error as Error;
    state.logger.error(`[get transaction] : ${err.message}`);
    return;
  }
});

export default router;

import express from "express";
import container from "../../inversify.config";
import IState from "../../interfaces/state.interface";
import { TYPES } from "../../types";
import { transactionModel } from "../../models/trasaction.model";

var router = express.Router();
const state = container.get<IState>(TYPES.State);

router.get("/", async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    const page = req.query.page?.toString() || 1;
    const limit = req.query.limit?.toString() || 1000000;

    let obj: any = {};
    if (startDate && endDate) {
      obj = {
        createdDate: {
          $gte: new Date(startDate as string),
          $lt: new Date(endDate as string),
        },
      };
    }

    res.status(200).respond(
      0,
      "success",
      await transactionModel
        .find(obj)
        .sort({ createdDate: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit)
    );

    return;
  } catch (error) {
    const err = error as Error;
    state.logger.error(`[get transaction] : ${err.message}`);
    return;
  }
});

export default router;

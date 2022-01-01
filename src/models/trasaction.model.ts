import { getModelForClass, prop } from "@typegoose/typegoose";

export class transaction {
  @prop()
  public name!: string;

  @prop()
  public address!: string;

  @prop()
  public tel!: string;

  @prop()
  public model!: string;

  @prop()
  public property!: string;

  @prop()
  public color!: string;

  @prop()
  public cod!: string;

  @prop()
  public num!: number;

  @prop()
  public total!: number;

  @prop()
  public admin!: string;

  @prop()
  public createdDate!: Date;

  @prop()
  public updatedDate?: Date;
}

export const transactionModel = getModelForClass(transaction, {
  schemaOptions: { collection: "cltTransactions" },
});

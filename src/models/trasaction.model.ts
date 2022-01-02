import { getModelForClass, prop } from "@typegoose/typegoose";

export class transaction {
  @prop()
  public page?: string;

  @prop()
  public model?: string;

  @prop()
  public size?: string;

  @prop()
  public color?: string;

  @prop()
  public num?: number;

  @prop()
  public paymentType?: string;

  @prop()
  public total?: number;

  @prop()
  public name?: string;

  @prop()
  public facebook?: string;

  @prop()
  public address?: string;

  @prop()
  public tel?: string;

  @prop()
  public admin?: string;

  @prop()
  public property?: string;

  @prop()
  public createdDate?: Date;

  @prop()
  public updatedDate?: Date;
}

export const transactionModel = getModelForClass(transaction, {
  schemaOptions: { collection: "cltTransactions" },
});

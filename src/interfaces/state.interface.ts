import winston from "winston";

interface IState {
  logger: winston.Logger;

  init(): Promise<void>;
}

export default IState;

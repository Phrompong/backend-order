import { Container } from "inversify";
import { TYPES } from "./types";
import IState from "./interfaces/state.interface";
import State from "./entities/state.entity";

const container = new Container();
container.bind<IState>(TYPES.State).to(State).inSingletonScope();
export default container;

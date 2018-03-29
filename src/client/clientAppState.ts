import { IClientAppState } from "../interfaces";

const clientAppState: IClientAppState = (<any>window).__CLIENT_APP_STATE__;
export default clientAppState;

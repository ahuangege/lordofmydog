import { app, Application } from "mydog";
import { svr_login } from "../../../app/svr_login/svr_login";

declare global {
    interface Rpc {
        login: {
            main: Remote,
        }
    }
}

export default class Remote {

    constructor(app: Application) {
    }

    isTokenOk(accId: number, token: number) {
        return svr_login.loginMgr.isTokenOk(accId, token);
    }
}
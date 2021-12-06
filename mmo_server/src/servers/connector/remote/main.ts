import { app, Application } from "mydog";
import { svr_con } from "../../../app/svr_connector/svr_con";
import { Dic } from "../../../app/util/util";
import { cmd } from "../../../config/cmd";

declare global {
    interface Rpc {
        connector: {
            main: Remote,
        }
    }
}

export default class Remote {
    private app: Application;
    constructor(app: Application) {
        this.app = app;
    }



    getClientNum(cb: (err: number, num: number) => void) {
        cb(0, app.clientNum);
    }

    /**
     * 配置玩家session
     */
    applySomeSession(uid: number, someSession: Dic<any>, cb?: (err: number) => void) {
        let session = this.app.getSession(uid);
        if (session) {
            session.set(someSession);
        }
        cb && cb(0);
    }

    /**
     * 账号登录时，踢掉已登录的连接
     */
    kickUserByAccId(accId: number, cb: (err: number) => void) {
        let session = svr_con.conMgr.accDic[accId];
        if (session) {
            session.send(cmd.onKicked, { "code": 10021 });
            session.close();
        }
        cb(0);
    }
}
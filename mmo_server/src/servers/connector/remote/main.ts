import { app, Application } from "mydog";
import { svr_con } from "../../../app/svr_connector/svr_con";
import { Dic } from "../../../app/util/util";
import { cmd } from "../../../config/cmd";
import { constKey } from "../../../app/common/someConfig";

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



    async getClientNum() {
        return app.clientNum;
    }

    /**
     * 配置玩家session
     */
    async applySomeSession(uid: number, someSession: Dic<any>) {
        let session = this.app.getSession(uid);
        if (session) {
            session.set(someSession);
        }
    }

    /**
     * 账号登录时，踢掉已登录的连接
     */
    async kickUserByAccId(accId: number) {
        let session = svr_con.conMgr.accDic[accId];
        if (session) {
            session.send(cmd.onKicked, { "code": 10021 });
            session.close();
        }
    }

    async kickUser(uid: number, code: number, notTellInfoSvr = false) {
        let session = this.app.getSession(uid);
        if (!session) {
            return;
        }
        session.send(cmd.onKicked, { "code": code });
        if (notTellInfoSvr) {
            session.setLocal(constKey.notTellInfoSvr, true);
        }
        session.close();
    }
}
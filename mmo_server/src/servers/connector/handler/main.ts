import { app, Application, Session } from "mydog";
import { gameLog } from "../../../app/common/logger";
import { constKey } from "../../../app/common/someConfig";
import { svr_con } from "../../../app/svr_connector/svr_con";
import { getInfoId } from "../../../app/util/gameUtil";
import { Db_account } from "../../../app/db/dbModel/accountTable";
import { dbTable } from "../../../app/db/dbTable";

export default class Handler {
    app: Application;
    constructor(app: Application) {
        this.app = app;
    }

    /** 选完角色后进入游戏 */
    async enter(msg: { "uid": number }, session: Session, next: Function) {
        if (session.uid) {
            return;
        }
        let uids = session.getLocal<number[]>(constKey.uids);
        if (!uids) {
            return;
        }
        if (!uids.includes(msg.uid)) {
            return;
        }
        session.bind(msg.uid);
        const info = await app.rpc(getInfoId(session.uid)).info.main.enterServer({ "uid": session.uid, "sid": session.sid });
        if (info.code !== 0) {
            return next({ "code": info.code });
        }
        session.set({ [constKey.mapSvr]: info.role.mapSvr, [constKey.mapIndex]: info.role.mapIndex });
        next(info);

        svr_con.mysql.update<Db_account>(dbTable.account, { "lastUid": session.uid }, { "where": { "id": session.getLocal(constKey.accId) }, "limit": 1 });
    }


    /**
     * 重连
     */
    async reconnectEnter(msg: { "uid": number, "token": number }, session: Session, next: Function) {
        if (session.uid) {
            return;
        }
        let infoId = getInfoId(msg.uid);
        const info = await this.app.rpc(infoId).info.main.reconnectEntry(msg.uid, this.app.serverId, msg.token);
        if (info.code !== 0) {
            return next(info);
        }
        session.bind(msg.uid);
        session.set({ "mapId": info.role.mapId });
        next(info);
    }


}



// 玩家socket断开
export function onUserLeave(session: Session) {
    gameLog.debug("--- one user leave :", session.uid);
    if (session.getLocal(constKey.accId)) {
        delete svr_con.conMgr.accDic[session.getLocal(constKey.accId)];
    }
    if (!session.uid) {
        return;
    }
    if (session.getLocal(constKey.notTellInfoSvr)) {
        return;
    }
    app.rpc(getInfoId(session.uid)).info.main.offline(session.uid);
}

export function onUserIn(session: Session) {
    gameLog.debug("--- one user connect", session.getIp());
}



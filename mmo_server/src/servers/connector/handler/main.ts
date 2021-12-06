import { app, Application, Session } from "mydog";
import { gameLog } from "../../../app/common/logger";
import { constKey, serverType } from "../../../app/common/someConfig";
import { svr_con } from "../../../app/svr_connector/svr_con";
import { getInfoId } from "../../../app/util/gameUtil";
import { createCountdown } from "../../../app/util/util";

export default class Handler {
    app: Application;
    constructor(app: Application) {
        this.app = app;
    }

    /** 选完角色后进入游戏 */
    enter(msg: { "uid": number }, session: Session, next: Function) {
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
        app.rpc(getInfoId(session.uid)).info.main.enterServer({ "uid": session.uid, "sid": session.sid }, (err, info) => {
            if (err) {
                return next({ "code": 1 });
            }
            if (info.code !== 0) {
                return next({ "code": info.code });
            }
            session.set({ [constKey.mapSvr]: info.role.mapSvr, [constKey.mapIndex]: info.role.mapIndex });
            next(info);
            svr_con.mysql.query("update account set lastUid = ? where id = ? limit 1", [session.uid, session.getLocal(constKey.accId)], (err) => {
                err && gameLog.error(err);
            });
        });
    }


    /**
     * 重连
     */
    reconnectEnter(msg: { "uid": number, "token": number }, session: Session, next: Function) {
        if (session.uid) {
            return;
        }
        let infoId = getInfoId(msg.uid);
        this.app.rpc(infoId).info.main.reconnectEntry(msg.uid, this.app.serverId, msg.token, (err, info) => {
            if (err) {
                return next({ "code": 1 });
            }
            if (info.code !== 0) {
                return next(info);
            }
            session.bind(msg.uid);
            session.set({ "mapId": info.role.mapId });
            next(info);
        });
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
    app.rpc(getInfoId(session.uid)).info.main.offline(session.uid);
}

export function onUserIn(session: Session) {
    gameLog.debug("--- one user connect", (session as any).socket.remoteAddress);
}



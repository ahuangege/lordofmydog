import { app, Session } from "mydog";
import { cfg_all } from "../../../app/common/configUtil";
import { gameLog } from "../../../app/common/logger";
import { constKey, serverType } from "../../../app/common/someConfig";
import { svr_con } from "../../../app/svr_connector/svr_con";
import { j2x2 } from "../../../app/svr_map/map";
import { getCharLen, getInfoId } from "../../../app/util/gameUtil";
import { randArrElement, removeFromArr } from "../../../app/util/util";
import { I_xy } from "../../map/handler/main";
import { Db_account } from "../../../app/db/dbModel/accountTable";
import { dbTable } from "../../../app/db/dbTable";
import { Db_role } from "../../../app/db/dbModel/roleTable";

let bornPos: I_xy[] = [{ "x": 20, "y": 29 }, { "x": 47, "y": 42 }];

export default class Handler {

    /** 获取角色列表 */
    async getRoleList(msg: { "accId": number, "accToken": number }, session: Session, next: Function) {
        if (session.getLocal(constKey.accId)) {    // 已验证过
            return;
        }
        if (typeof msg.accId !== "number") {
            return;
        }
        let ok = await app.rpc(constKey.loginSvr).login.main.isTokenOk(msg.accId, msg.accToken);
        if (!ok) {
            return next({ "code": 10020 });
        }
        session.setLocal(constKey.accId, msg.accId);

        const promiseArr: any[] = [];
        let svrs = app.getServersByType(serverType.connector);
        for (let one of svrs) {
            promiseArr.push(app.rpc(one.id).connector.main.kickUserByAccId(msg.accId));
        }
        await Promise.all(promiseArr);
        svr_con.conMgr.accDic[msg.accId] = session;

        const res = await svr_con.mysql.select<Db_account>(dbTable.account, ["lastUid"], { "where": { "id": msg.accId }, "limit": 1 });
        const list = await svr_con.mysql.select<Db_role>(dbTable.player, ["uid", "heroId", "level", "nickname"], { "where": { "isDelete": 0, "accId": msg.accId }, "limit": 3 });
        let uids: number[] = [];
        for (let one of list) {
            uids.push(one.uid);
            app.rpc(getInfoId(one.uid), true).info.main.loginResetToken(one.uid);
        }
        session.setLocal(constKey.uids, uids);

        next({ "code": 0, "list": list, "lastUid": res[0].lastUid });
    }

    /** 创建角色 */
    async createRole(msg: { "heroId": number, "nickname": string }, session: Session, next: Function) {
        let uids = session.getLocal<number[]>(constKey.uids);
        if (!uids) {
            console.log(111)
            return;
        }
        if (uids.length >= 3) {
            console.log(222)
            return;
        }

        let allLen = 0;
        for (let i = 0; i < msg.nickname.length; i++) {
            allLen += getCharLen(msg.nickname.charCodeAt(i));
        }
        if (allLen < 5 || allLen > 15) {
            next({ "code": 10023 });
            return;
        }
        let cfg = cfg_all().hero[msg.heroId];
        let pos = randArrElement(bornPos);

        const oneRole = new Db_role();
        oneRole.accId = session.getLocal(constKey.accId);
        oneRole.nickname = msg.nickname;
        oneRole.heroId = msg.heroId;
        oneRole.x = j2x2(pos.x);
        oneRole.y = j2x2(pos.y);
        oneRole.learnedSkill.push(cfg.initSkill);
        oneRole.skillPos = [cfg.initSkill, 0, 0];

        try {
            delete (oneRole as any).uid;
            const res = await svr_con.mysql.insert<Db_role>(dbTable.player, oneRole);
            uids.push(res.insertId);
            next({ "code": 0, "role": { "uid": res.insertId, "heroId": oneRole.heroId, "level": oneRole.level, "nickname": oneRole.nickname } });

        } catch (err: any) {
            if (err?.errno === constKey.duplicateKey) {
                return next({ "code": 10022 });
            } else {
                gameLog.error(err);
                return next({ "code": 1 })
            }
        }
    }

    /** 删除角色 */
    async deleteRole(msg: { "uid": number }, session: Session, next: Function) {
        let uids = session.getLocal<number[]>(constKey.uids);
        if (!uids) {
            return;
        }
        if (!uids.includes(msg.uid)) {
            return;
        }
        await svr_con.mysql.update<Db_role>(dbTable.player, { "isDelete": 1 }, { "where": { "uid": msg.uid, "accId": session.getLocal(constKey.accId) }, "limit": 1 });
        removeFromArr(uids, msg.uid);
        next({ "code": 0, "uid": msg.uid });
    }
}
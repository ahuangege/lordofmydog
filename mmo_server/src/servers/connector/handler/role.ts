import { app, Session } from "mydog";
import { constKey, serverType } from "../../../app/common/someConfig";
import { svr_con } from "../../../app/svr_connector/svr_con";
import { I_roleInfo } from "../../../app/svr_info/roleInfo";
import { getCharLen, getInfoId } from "../../../app/util/gameUtil";
import { getInsertSql } from "../../../app/util/mysql";
import { createCountdown, removeFromArr } from "../../../app/util/util";


export default class Handler {

    /** 获取角色列表 */
    async getRoleList(msg: { "accId": number, "accToken": number }, session: Session, next: Function) {
        if (session.getLocal("accId")) {    // 已验证过
            return;
        }
        if (typeof msg.accId !== "number") {
            return;
        }
        let ok = await app.rpcAwait(constKey.loginSvr).login.main.isTokenOk(msg.accId, msg.accToken);
        if (!ok) {
            return next({ "code": 10020 });
        }

        let svrs = app.getServersByType(serverType.connector);
        let countdown = createCountdown(svrs.length, () => {

            session.setLocal("accId", msg.accId);
            svr_con.conMgr.accDic[msg.accId] = session;
            selectRoleList();

        });
        for (let one of svrs) {
            app.rpc(one.id).connector.main.kickUserByAccId(msg.accId, (err) => {
                countdown.down();
            });
        }

        function selectRoleList() {
            svr_con.mysql.query("select uid, heroId, level,nickname from player where accId = ? and isDelete = 0 limit 3", [msg.accId], (err, list: any[]) => {
                if (err) {
                    return next({ "code": 1 });
                }
                let uids: number[] = [];
                for (let one of list) {
                    uids.push(one.uid);
                    app.rpc(getInfoId(one.uid)).info.main.loginResetToken(one.uid);
                }
                session.setLocal("uids", uids);
                next({ "code": 0, "list": list });
            });
        }
    }

    /** 创建角色 */
    createRole(msg: { "heroId": number, "nickname": string }, session: Session, next: Function) {
        let uids = session.getLocal<number[]>("uids");
        if (!uids) {
            return;
        }
        if (uids.length >= 3) {
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

        type I_roleinfoNoUid = Exclude<keyof I_roleInfo, "uid">
        let oneRole: { [p in I_roleinfoNoUid]: I_roleInfo[p] } = {
            "accId": session.getLocal("accId"),
            "nickname": msg.nickname,
            "gold": 1000,
            "heroId": msg.heroId,
            "level": 1,
            "exp": 0,
            "mapId": 1,
            "x": 1,
            "y": 1,
            "hp": 1,
            "mp": 1,
            "isDelete": 0,
        };
        let sql = getInsertSql("player", oneRole);
        svr_con.mysql.query(sql, null, (err, res) => {
            if (err) {
                if (err.errno === constKey.duplicateKey) {
                    return next({ "code": 10022 });
                } else {
                    return next({ "code": 1 })
                }
            }
            uids.push(res.insertId);
            next({ "code": 0, "role": { "uid": res.insertId, "heroId": oneRole.heroId, "level": oneRole.level, "nickname": oneRole.nickname } });
        });
    }

    /** 删除角色 */
    deleteRole(msg: { "uid": number }, session: Session, next: Function) {
        let uids = session.getLocal<number[]>("uids");
        if (!uids) {
            return;
        }
        if (!uids.includes(msg.uid)) {
            return;
        }
        svr_con.mysql.query("update player set isDelete = 1 where uid = ? and accId = ? limit 1", [msg.uid, session.getLocal("accId")], (err, res) => {
            if (err) {
                return next({ "code": 1 });
            }
            removeFromArr(uids, msg.uid);
            next({ "code": 0, "uid": msg.uid });
        });
    }
}
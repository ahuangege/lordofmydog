import { gameLog } from "../common/logger";
import { friendState, I_roleAllInfo } from "../common/someInterface";
import { getInsertSql, getInsertSqlArr } from "../util/mysql";
import { timeFormat, randStr } from "../util/util";
import { I_friendCache } from "./roleInfoMgr";
import { I_roleInfo, roleMysql } from "./roleInfo";
import { svr_info } from "./svr_info";


/**
 * 登录时的处理
 */
export class LoginUtil {
    constructor() {
    }

    getAllRoleInfo(uid: number, cb: (err: any, allInfo: I_roleAllInfo) => void) {
        this.getRoleInfo(uid, (err, role) => {
            if (err) {
                return cb(err, null as any);
            }
            this.getFriends(uid, (err, friends) => {
                if (err) {
                    return cb(err, null as any);
                }
                this.checkPublicMails(uid, (err) => {
                    if (err) {
                        return cb(err, null as any);
                    }
                    cb(null, { "role": role });
                });

            });
        });
    }


    private getRoleInfo(uid: number, cb: (err: any, info: I_roleInfo) => void) {
        let sql = "select * from player where uid = ? limit 1";
        svr_info.mysql.query(sql, [uid], (err, res: I_roleInfo[]) => {
            if (err) {
                return cb(err, null as any);
            }
            if (res.length === 0) {
                return cb(new Error("role info not exists"), null as any);
            } else {
                let tmpRole = res[0];
                let key: keyof I_roleInfo;
                for (key in roleMysql) {
                    if (typeof roleMysql[key] === "object") {
                        (tmpRole as any)[key] = JSON.parse((tmpRole as any)[key]);
                    }
                }
                cb(null, tmpRole);
            }
        });
    }


    private getFriends(uid: number, cb: (err: any, friends: { "list": number[], "asklist": number[] }) => void) {
        return cb(null, { "list": [], "asklist": [] })
        let sql = "select uidF,state from friend where uid = ?";
        svr_info.mysql.query(sql, [uid], (err: any, res: { "uidF": number, "state": number }[]) => {
            if (err) {
                return cb(err, null as any);
            }
            let friends: { "list": number[], "asklist": number[] } = { "list": [], "asklist": [] };
            for (let one of res) {
                if (one.state === friendState.friend) {
                    friends.list.push(one.uidF);
                } else {
                    friends.asklist.push(one.uidF);
                }
            }
            cb(null, friends);
        });
    }

    /**
     * 从数据库中获取一些好友信息
     */
    getFriendInfoFromDb(uid: number, cb: (info: I_friendCache) => void) {
        let sql = "select nickname from player where uid = ? limit 1";
        svr_info.mysql.query(sql, [uid], function (err, res) {
            if (err) {
                gameLog.error(err);
                return cb(null as any);
            }
            if (res.length === 0) {
                return cb(null as any);
            }
            res = res[0];
            let info: I_friendCache = {
                "nickname": res["nickname"],
                "delTime": 0,
            }
            cb(info);
        });
    }

    // 检测全服邮件个人存储
    private checkPublicMails(uid: number, cb: (err: any) => void) {
        return cb(null);
        svr_info.mysql.query("select uid from mail_all where uid = ? limit 1", [uid], (err: any, res: any[]) => {
            if (err) {
                return cb(err);
            }
            if (res.length === 1) {
                return cb(null);
            }
            let str = JSON.stringify([]);
            svr_info.mysql.query("insert into mail_all(uid,readIds,getAwardIds,delIds,deadId) values(?,?,?,?,?)", [uid, str, str, str, 0], (err) => {
                if (err) {
                    return cb(err);
                }
                cb(null);
            });
        });
    }
}
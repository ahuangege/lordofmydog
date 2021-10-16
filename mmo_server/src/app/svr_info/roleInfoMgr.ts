import { Application, rpcErr } from "mydog";
import { gameLog } from "../common/logger";
import { I_roleAllInfoClient, I_uidsid } from "../common/someInterface";
import { nowMs } from "../common/time";
import { Dic, randIntNum, removeFromArr } from "../util/util";
import { LoginUtil } from "./loginUtil";
import { E_lock, RoleInfo } from "./roleInfo";
import { svr_info } from "./svr_info";


export class RoleInfoMgr {
    private app: Application;
    public loginUtil: LoginUtil;                        // 登陆 util
    private roles: Dic<RoleInfo> = {};    // 所有玩家数据
    private sqlRoles: Set<RoleInfo> = new Set();
    offlineFriendCache: Dic<I_friendCache> = {};   // 不在线玩家，好友信息缓存

    constructor(app: Application) {
        this.app = app;
        this.loginUtil = new LoginUtil();
        setInterval(this.sqlRoleUpdate.bind(this), 5000);
        setInterval(this.check_delRole.bind(this), 3600 * 1000);
    }

    /**
     * 玩家登录游戏
     * @param uid 
     */
    enterServer(msg: I_uidsid, cb: (err: number, info: I_roleAllInfoClient) => void) {
        let role = this.roles[msg.uid];
        if (!role) {
            this.loginUtil.getAllRoleInfo(msg.uid, (err, allInfo) => {
                if (err) {
                    gameLog.error(err);
                    return cb(0, { "code": 1 } as any);
                }
                if (this.roles[msg.uid]) {
                    return cb(0, { "code": 1 } as any);
                }
                delete this.offlineFriendCache[msg.uid];
                role = new RoleInfo(allInfo);
                this.roles[msg.uid] = role;

                role.setLock(E_lock.login, true);
                role.changeRoleMem({ "token": randIntNum(1000000) });
                role.entryServerLogic(msg.sid, cb);
            });
            return;
        }
        if (role.getLock(E_lock.login)) {
            return cb(0, { "code": 1 } as any);
        }
        role.setLock(E_lock.login, true);
        role.changeRoleMem({ "token": randIntNum(1000000) });
        role.entryServerLogic(msg.sid, cb);
    }

    /**
     * 重连
     */
    reconnectEntry(uid: number, sid: string, token: number, cb: (err: rpcErr, info: I_roleAllInfoClient) => void) {
        let role = this.roles[uid];
        if (!role) {
            return cb(0, { "code": 1 } as any);
        }
        if (role.roleMem.token !== token) {
            return cb(0, { "code": 10021 } as any);
        }
        if (role.sid) {
            return;
        }
        if (role.getLock(E_lock.login)) {
            return cb(0, { "code": 1 } as any);
        }
        role.setLock(E_lock.login, true);
        role.entryServerLogic(sid, cb);
    }


    /**
    * 定时落地玩家的player信息
    */
    private sqlRoleUpdate() {
        let perNum = 50;
        for (let one of this.sqlRoles) {
            this.sqlRoles.delete(one);
            one.updateSql();
            perNum--;
            if (perNum === 0) {
                break;
            }
        }
    }

    // 检测过期玩家，删除缓存数据
    private check_delRole() {
        let one: RoleInfo;
        let nowTime = nowMs();
        for (let uid in this.roles) {
            one = this.roles[uid];
            if (one.delThisTime !== 0 && nowTime > one.delThisTime) {
                delete this.roles[uid];
                one.onDestroy();
            }
        }

        for (let uid in this.offlineFriendCache) {
            if (nowTime > this.offlineFriendCache[uid].delTime) {
                delete this.offlineFriendCache[uid];
            }
        }
    }


    addToSqlPool(role: RoleInfo) {
        this.sqlRoles.add(role);
    }

    /**
     * 获取玩家信息
     */
    getRole(uid: number) {
        return this.roles[uid];
    }
}


export const friendCacheDelTime = 50 * 3600 * 1000;

export interface I_friendCache {
    "nickname": string,
    "delTime": number,
}


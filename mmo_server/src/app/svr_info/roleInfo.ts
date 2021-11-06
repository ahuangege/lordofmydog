import { gameLog } from "../common/logger";
import { friendState, I_friendInfo_client, I_roleAllInfo, I_roleAllInfoClient, I_roleMem, I_uidsid } from "../common/someInterface";
import { svr_info } from "./svr_info";
import { constKey } from "../common/someConfig";
import { app } from "mydog";
import { nowMs } from "../common/time";
import { cmd } from "../../config/cmd";
import { getBit, getDiffDays, randArrElement, setBit, timeFormat } from "../util/util";
import { Friend } from "./friend";
import { MapIdMgr } from "../svr_map/mapIdMgr";
import { I_playerMapJson } from "../../servers/map/handler/main";
import { cfg_all } from "../common/configUtil";
import { Bag, I_item } from "./bag";
import { Equipment } from "./equipment";

export class RoleInfo {
    public uid: number;
    public sid: string = "";
    public role: I_roleInfo;
    public roleMem: I_roleMem;

    public friend: Friend;
    public bag: Bag;
    public equip: Equipment;

    private lock = 0;   // 部分操作上锁
    private changedKey: { [key in keyof I_roleInfo]?: boolean } = {};
    private changed = false;
    public delThisTime: number = 0; // 玩家下线后删除时刻
    private isInSql = false;

    constructor(allInfo: I_roleAllInfo) {
        this.uid = allInfo.role.uid;
        this.role = allInfo.role;

        this.friend = new Friend(this, { "list": [], "asklist": [] });
        this.bag = new Bag(this, allInfo.bag);
        this.equip = new Equipment(this, allInfo.equip);

        this.roleMem = {
            "mapSvr": MapIdMgr.getSvr(this.role.mapId),
            "mapIndex": this.role.mapId,
            "token": 0,
        }

    }


    entryServerLogic(sid: string, cb: (err: number, endInfo: I_roleAllInfoClient) => void) {
        this.sid = sid;

        app.rpc(this.roleMem.mapSvr).map.main.isMapOk(this.role.mapId, this.roleMem.mapIndex, this.uid, (err, ok) => {
            if (err) {
                return cb(0, { "code": 1 } as any);
            }

            if (!ok) {
                let mapData = cfg_all().map[this.role.mapId];
                if (mapData.isCopy) {
                    this.changeRoleInfo({ "mapId": mapData.copyEnter.mapId, "x": mapData.copyEnter.x, "y": mapData.copyEnter.y });
                    this.changeRoleMem({ "mapSvr": MapIdMgr.getSvr(this.role.mapId), "mapIndex": this.role.mapId });
                }
            }
            this.online();
            let role = this.role;
            let allInfo: I_roleAllInfoClient = {
                "code": 0,
                "role": {
                    "uid": this.uid,
                    "accId": role.accId,
                    "nickname": role.nickname,
                    "gold": role.gold,
                    "heroId": role.heroId,
                    "level": role.level,
                    "exp": role.exp,
                    "mapId": role.mapId,
                    "mapSvr": this.roleMem.mapSvr,
                    "mapIndex": this.roleMem.mapIndex,
                    "bag": this.bag.getBag(),
                    "equip": this.equip.equip,
                    "learnedSkill": role.learnedSkill,
                    "skillPos": role.skillPos,
                    "hpPos": role.hpPos,
                    "mpPos": role.mpPos,
                }
            }
            cb(0, allInfo);
            this.setLock(E_lock.login, false);
        });
    }


    private online() {
        this.delThisTime = 0;
    }

    offline() {
        if (!this.sid) {
            return;
        }
        this.delThisTime = nowMs() + 48 * 3600 * 1000;
        this.sid = "";

        app.rpc(this.roleMem.mapSvr).map.main.leaveMap(this.roleMem.mapIndex, this.uid);

    }


    changeSqlKey(key: keyof I_roleInfo) {
        if (!this.changedKey[key]) {
            this.changedKey[key] = true;
            this.changed = true;
            this.addToSqlPool();
        }
    }

    addToSqlPool() {
        if (!this.isInSql) {
            this.isInSql = true;
            svr_info.roleInfoMgr.addToSqlPool(this);
        }
    }

    updateSql() {

        this.isInSql = false;
        this.bag.updateSql();
        this.equip.updateSql();

        if (!this.changed) {
            return;
        }
        this.changed = false;

        let updateArr: string[] = [];
        let key: keyof I_roleInfo;
        for (key in this.changedKey) {
            let typeStr = typeof roleMysql[key];
            if (typeStr === "string") {
                updateArr.push(key + "='" + this.role[key] + "'");
            } else if (typeStr === "object") {
                updateArr.push(key + "='" + JSON.stringify(this.role[key]) + "'");
            } else {
                updateArr.push(key + "=" + this.role[key]);
            }
        }
        if (updateArr.length === 0) {
            return;
        }
        this.changedKey = {};
        let sql = "update player set " + updateArr.join(",") + " where uid = " + this.uid + " limit 1";
        svr_info.mysql.query(sql, null, (err) => {
            if (err) {
                gameLog.error(err);
            }
        });
    }


    /**
       * 玩家信息改变
       */
    changeRoleInfo(changed: { [K in keyof I_roleInfo]?: I_roleInfo[K] }) {
        let key: keyof I_roleInfo;
        for (key in changed) {
            (this.role as any)[key] = changed[key];
            this.changedKey[key] = true;
        }
        this.changed = true;
        this.addToSqlPool();
    }

    changeRoleMem(changed: { [K in keyof I_roleMem]?: I_roleMem[K] }) {
        let key: keyof I_roleMem;
        for (key in changed) {
            (this.roleMem as any)[key] = changed[key];
        }
    }

    addGold(num: number) {
        this.role.gold += num;
        this.changeSqlKey("gold");
        this.getMsg(cmd.onGoldChanged, { "num": this.role.gold });
    }
    costGold(num: number) {
        if (this.role.gold < num) {
            return false;
        } else {
            this.role.gold -= num;
            this.changeSqlKey("gold");
            this.getMsg(cmd.onGoldChanged, { "num": this.role.gold });
            return true;
        }
    }
    hasGold(num: number) {
        return this.role.gold >= num;
    }


    getMsg(route: number, msg: any = null) {
        if (this.sid) {
            app.sendMsgByUidSid(route, msg, [{ "uid": this.uid, "sid": this.sid }]);
        }
    }

    getFriendInfo(state: friendState): I_friendInfo_client {
        let role = this.role;
        return {
            "uid": role.uid,
            "nickname": role.nickname,
            "state": state,
        };
    }



    getLock(lockT: E_lock) {
        return getBit(this.lock, lockT);
    }

    setLock(lockT: E_lock, lock: boolean) {
        this.lock = setBit(this.lock, lockT, lock);
    }

    toMapJson(): I_playerMapJson {
        let role = this.role;
        return {
            "uid": this.uid,
            "sid": this.sid,
            "nickname": role.nickname,
            "heroId": role.heroId,
            "level": role.level,
            "mapId": role.mapId,
            "mapIndex": this.roleMem.mapIndex,
            "x": role.x,
            "y": role.y,
            "equip": this.equip.equip,
            "skillPos": role.skillPos,
            "hpPos": role.hpPos,
            "mpPos": role.mpPos,
        }
    }

    /** 增加英雄经验值 */
    addExp(num: number) {
        let cfg = cfg_all().heroLv[this.role.heroId];
        if (cfg[this.role.level].exp === -1) {    // 已经满级了
            return;
        }
        while (true) {
            if (num + this.role.exp >= cfg[this.role.level].exp) {    // 升级
                num -= (cfg[this.role.level].exp - this.role.exp);
                this.role.level += 1;
                this.role.exp = 0;
                if (cfg[this.role.level].exp === -1) {    // 已经满级了
                    break;
                }
            } else {
                this.role.exp += num;
                break;
            }
        }
        this.changeSqlKey("level");
        this.changeSqlKey("exp");
        this.getMsg(cmd.onLvExpChanged, { "lv": this.role.level, "exp": this.role.exp });
    }

}


// 数据库里的玩家数据（注意，类型需要正确）
export let roleMysql: I_roleInfo = {
    "uid": 1,
    "accId": 1,
    "nickname": "a",
    "gold": 1,
    "heroId": 1,
    "level": 1,
    "exp": 1,
    "mapId": 1,
    "x": 1,
    "y": 1,
    "hp": 1,
    "mp": 1,
    "learnedSkill": [],
    "skillPos": [],
    "hpPos": {} as any,
    "mpPos": {} as any,
    "isDelete": 1,
};


export interface I_roleInfo {
    "uid": number,              // uid
    "accId": number,            // 账号id
    "nickname": string,         // 昵称
    "gold": number,             // 金币
    "heroId": number,           // 英雄id
    "level": number,            // 等级
    "exp": number,              // 经验值
    "mapId": number,            // 当前地图
    "x": number,                // 当前地图，坐标x
    "y": number,                // 当前地图，坐标y
    "hp": number,               // 血量
    "mp": number,               // 蓝量
    "learnedSkill": number[],   // 已学习的技能
    "skillPos": number[],         // 使用中的技能栏
    "hpPos": I_item,           // 快速加血栏
    "mpPos": I_item,           // 快速加蓝栏
    "isDelete": number,         // 角色是否被删除
}


export const enum E_lock {
    login,
    friend,
}


export const enum E_itemT {
    gold = 0,               // 金币
    weapon = 1,             // 武器栏
    armor_physical = 2,    // 物抗栏
    armor_magic = 3,        // 魔抗栏
    hp_add = 4,     // 加血上限栏
    mp_add = 5,     // 加魔上限栏
    hp = 6,         // 快速加血栏
    mp = 7,         // 快速加蓝栏
}
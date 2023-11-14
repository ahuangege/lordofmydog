import { gameLog } from "../common/logger";
import { I_roleAllInfo, I_roleAllInfoClient, I_roleMem, I_uidsid } from "../common/someInterface";
import { svr_info } from "./svr_info";
import { constKey } from "../common/someConfig";
import { app } from "mydog";
import { nowMs } from "../common/time";
import { cmd } from "../../config/cmd";
import { MapIdMgr } from "../svr_map/mapIdMgr";
import { I_playerMapJson } from "../../servers/map/handler/main";
import { cfg_all, I_cfg_mapDoor } from "../common/configUtil";
import { Bag, I_item } from "./bag";
import { Equipment } from "./equipment";
import { j2x2 } from "../svr_map/map";
import { Db_role } from "../db/dbModel/roleTable";
import { getUpdateObj } from "../util/gameUtil";

export class RoleInfo {
    public uid: number;
    public sid: string = "";
    public role: Db_role;
    public roleMem: I_roleMem;

    public bag: Bag;
    public equip: Equipment;

    private changedKey: { [key in keyof Db_role]?: boolean } = {};
    private isInSql = false;

    public delThisTime: number = 0; // 玩家下线后删除时刻

    constructor(allInfo: I_roleAllInfo) {
        this.uid = allInfo.role.uid;
        this.role = allInfo.role;

        this.bag = new Bag(this, allInfo.bag);
        this.equip = new Equipment(this, allInfo.equipment);

        let svr = "";
        if (cfg_all().map[this.role.mapId].isCopy) {
            svr = MapIdMgr.getCopySvr();
        } else {
            svr = MapIdMgr.getSvr(this.role.mapId);
        }
        this.roleMem = {
            "mapSvr": svr,
            "mapIndex": this.role.mapId,
            "token": 0,
        }

    }


    async entryServerLogic(sid: string): Promise<I_roleAllInfoClient> {
        if (this.sid) {
            this.kick(10021);
        }
        this.sid = sid;
        const ok = await app.rpc(this.roleMem.mapSvr).map.main.isMapOk(this.role.mapId, this.roleMem.mapIndex, this.uid);
        if (!ok) {
            let mapData = cfg_all().map[this.role.mapId];
            if (mapData.isCopy) {
                let doorCfg: I_cfg_mapDoor = null as any;
                for (let x in cfg_all().mapDoor) {
                    let one = cfg_all().mapDoor[x];
                    if (one.mapId === this.role.mapId) {
                        doorCfg = one;
                        break;
                    }
                }
                this.changeRoleInfo({ "mapId": doorCfg.mapId2, "x": j2x2(doorCfg.x2), "y": j2x2(doorCfg.y2) });
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
        return allInfo;
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

        svr_info.syncUtil.saveUid(this.uid);
    }

    //#region  玩家的信息改变，数据库
    private addToSqlPool() {
        if (!this.isInSql) {
            this.isInSql = true;
            svr_info.syncUtil.sync.playerSync.updateRole(this.uid, this);
        }
    }
    public getSqlUpdateObj() {
        let updateObj: Partial<Db_role> = getUpdateObj(this.role, this.changedKey);
        this.changedKey = {};
        this.isInSql = false;
        return updateObj;
    }

    changeSqlKey(key: keyof Db_role) {
        if (!this.changedKey[key]) {
            this.changedKey[key] = true;
            this.addToSqlPool();
        }
    }
    changeSqlKeys(keys: (keyof Db_role)[]) {
        for (let key of keys) {
            this.changeSqlKey(key);
        }
    }
    changeRoleInfo(changed: Partial<Db_role>) {
        let key: keyof Db_role;
        for (key in changed) {
            (this.role as any)[key] = changed[key];
            this.changedKey[key] = true;
        }
        this.addToSqlPool();
    }

    changeRoleMem(changed: Partial<I_roleMem>) {
        let key: keyof I_roleMem;
        for (key in changed) {
            (this.roleMem as any)[key] = changed[key];
        }
    }
    //#endregion



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
            "hp": role.hp,
            "mp": role.mp,
        }
    }

    /** 增加英雄经验值 */
    addExp(num: number) {
        let cfg = cfg_all().heroLv[this.role.heroId];
        if (cfg[this.role.level].exp === -1) {    // 已经满级了
            return;
        }
        let lastLv = this.role.level;
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
        if (this.role.level !== lastLv) {
            app.rpc(this.roleMem.mapSvr).map.main.onHeroLvUp(this.roleMem.mapIndex, this.uid, this.role.level);
        }
    }

    kick(code: number) {
        if (!this.sid) {
            return;
        }
        app.rpc(this.sid, true).connector.main.kickUser(this.uid, code, true);
        this.offline();
    }

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
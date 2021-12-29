import { app } from "mydog";
import { cmd } from "../../config/cmd";
import { I_syncSomeInfo } from "../../servers/info/remote/map";
import { I_playerMapJson, I_xy } from "../../servers/map/handler/main";
import { cfg_all } from "../common/configUtil";
import { nowMs, nowSec } from "../common/time";
import { I_item } from "../svr_info/bag";
import { I_equipment } from "../svr_info/equipment";
import { E_itemT } from "../svr_info/roleInfo";
import { getInfoId } from "../util/gameUtil";
import { Dic, getLen, getLen2 } from "../util/util";
import { Entity_type, I_entityJson } from "./entity";
import { Item } from "./item";
import { Map } from "./map";
import { Role } from "./role";

const moveSpeed = 280;


/** 玩家 */
export class Player extends Role {
    uid: number;
    sid: string;
    heroId: number;     // 英雄id
    level: number;      // 英雄等级
    nickname: string;   // 昵称
    chatMapTime: number = 0;   // 上次场景聊天时刻
    equip: I_equipment;   // 装备
    skillPos: number[]; // 技能栏
    x2: number; // 上次同步的x
    y2: number; // 上次同步的y
    hp2: number;// 上次同步的hp
    mp2: number;// 上次同步的mp
    syncTime: number = 0;    // 定时同步一些信息到info服的计时器
    copyMatchDoorId: number = 0;    // 当前副本匹配的门id
    copyMatchTime: number = 0;  // 副本匹配的时间

    constructor(map: Map, info: I_playerMapJson) {
        super({ "map": map, "id": map.getId(), "t": Entity_type.player, "x": info.x, "y": info.y });
        this.speed = moveSpeed;


        this.uid = info.uid;
        this.sid = info.sid;
        this.heroId = info.heroId;
        this.level = info.level;
        this.nickname = info.nickname;
        this.equip = info.equip;
        this.skillPos = info.skillPos;
        this.x2 = Math.floor(this.x);
        this.y2 = Math.floor(this.y);
        this.hp = info.hp;
        this.mp = info.mp;
        this.hp2 = this.hp;
        this.mp2 = this.mp;

        this.recountBaseInfo(true);
        for (let id of this.skillPos) {
            if (id) {
                this.skillMgr.addSkill(id);
            }
        }
    }

    /** 进入地图 */
    enterMap() {
        let map = this.map;
        map.addEntity(this);
        map.addOrDelUidsid(this.uid, this.sid, true);
        map.playerIn(this);

        // 通知视野内的其他玩家
        map.getEntityChangeMsg({ "addEntities": [this.toJson()] }, map.towerAOI.getWatchers(this));

        // 加入到实体列表，添加为监视者
        map.towerAOI.addObj(this, this);
        map.towerAOI.addWatcher(this, this);

        // 获取视野内实体数据
        let entities = map.towerAOI.getObjs(this);
        let jsonArr: I_entityJson[] = [];
        for (let one of entities) {
            jsonArr.push(one.toJson());
        }
        return jsonArr;
    }

    /** 离开地图 */
    leaveMap() {
        this.skillMgr.destroy();
        this.buffMgr.destroy();

        let map = this.map;
        map.delEntity(this);
        map.addOrDelUidsid(this.uid, this.sid, false);
        map.playerLeave(this);

        // 移除监视，移除实体
        map.towerAOI.delWatcher(this, this);
        map.towerAOI.delObj(this, this);

        // 通知视野内其他玩家
        map.getEntityChangeMsg({ "delEntities": [this.id] }, map.towerAOI.getWatchers(this));

        this.checkSync();

        if (this.copyMatchDoorId) {
            this.map.copyMatchDic[this.copyMatchDoorId].cancelMatch(this);
        }
    }

    /** 移动 */
    move(msg: { "x": number, "y": number, "path": I_xy[] }) {
        if (this.isDie()) {
            return;
        }
        if (!this.buffMgr.canMove()) {
            return;
        }
        let map = this.map;
        // 验证坐标合法性
        msg.x = Math.floor(msg.x) || 0;
        msg.y = Math.floor(msg.y) || 0;
        if (msg.x <= 0 || msg.x >= map.width) {
            return;
        }
        if (msg.y <= 0 || msg.y >= map.width) {
            return;
        }
        // if (getLen2(msg, this) > 22500) {    // 距离误差过大，纠正客户端
        //     return;
        // }
        // let pathTile: I_xy[] = [{ "x": Math.floor(msg.x / tileW), "y": Math.floor(msg.y / tileW) }];
        // let meX = Math.floor(this.x / tileW);
        // let meY = Math.floor(this.y / tileW);

        // 检查客户端位置与服务器位置间能否通行
        // if (pathTile[0].x !== meX || pathTile[0].y !== meY) {
        //     let verifyPath = this.map.pathFind.findPath(pathTile[0].x, pathTile[0].y, meX, meY, 5);
        //     let endTile = verifyPath[verifyPath.length - 1];
        //     if (endTile && (endTile.x !== meX || endTile.y !== meY)) {  // 不能通行，纠正客户端
        //         return;
        //     }
        // }

        for (let one of msg.path) {
            one.x = Math.floor(one.x) || 0;
            one.y = Math.floor(one.y) || 0;
            if (one.x <= 0 || one.x >= map.width) {
                return;
            }
            if (one.y <= 0 || one.y >= map.height) {
                return;
            }
            // pathTile.push({ "x": Math.floor(one.x / tileW), "y": Math.floor(one.y / tileW) });
        }
        // if (!this.checkPathLine(pathTile)) {  // 寻路数据不对，纠正客户端
        //     return;
        // }


        let oldPos: { "x": number, "y": number } = { "x": this.x, "y": this.y };

        this.x = msg.x;
        this.y = msg.y;
        this.path = msg.path;

        this.map.sendMsgByAOI(this, cmd.onMove, { "id": this.id, "path": msg.path });

        map.towerAOI.updateWatcher(this, oldPos, this);
        map.towerAOI.updateObj(this, oldPos, this);
    }

    private checkPathLine(path: I_xy[]): boolean {
        return true;
        // let start = { "x": Math.floor(one.x / tileW), "y": one.y };
        // if (one.x === two.x) {
        //     if (one.y === two.y) {
        //         return false;
        //     }
        //     let dy = two.y - tmp.y;
        //     dy = dy / Math.abs(dy);
        //     tmp.y
        //     while ()
        //         return;
        // }
    }



    update(dt: number) {
        super.update(dt);

        this.syncTime += dt;
        if (this.syncTime >= 10) {   // 每10秒同步一次到info服
            this.syncTime = 0;
            this.checkSync();
        }
    }

    /** 检测是否需要同步 */
    private checkSync() {
        let hpmp: { "hp": number, "mp": number } = null as any;
        if (this.hp2 !== this.hp || this.mp2 !== this.mp) {
            this.hp2 = this.hp;
            this.mp2 = this.mp;
            hpmp = { "hp": this.hp, "mp": this.mp };
        }

        let xy: I_xy = null as any;
        if (Math.floor(this.x) !== this.x2 || Math.floor(this.y) !== this.y2) {
            this.x2 = Math.floor(this.x);
            this.y2 = Math.floor(this.y);
            xy = { "x": this.x2, "y": this.y2 };
        }

        if (hpmp || xy) {
            app.rpc(getInfoId(this.uid)).info.map.syncSomeInfo(this.uid, xy, hpmp);
        }
    }


    /** 本场景聊天  */
    chatMap(msg: { "msg": string }) {
        if (nowMs() - this.chatMapTime < 1 * 1000) {
            return;
        }
        this.chatMapTime = nowMs();
        this.map.getMsg(cmd.onChatMap, { "id": this.id, "nickname": this.nickname, "msg": msg.msg });
    }


    /** 修改昵称 */
    changeNickname(nickname: string) {
        this.nickname = nickname;
        this.map.sendMsgByAOI(this, cmd.onNicknameChanged, { "id": this.id, "nickname": nickname });
    }

    /** 装备变化了 */
    onEquipChanged(equip: { "t": E_itemT, "id": number }) {
        switch (equip.t) {
            case E_itemT.weapon:
                this.equip.weapon = equip.id;
                break;
            case E_itemT.armor_physical:
                this.equip.armor_physical = equip.id;
                break;
            case E_itemT.armor_magic:
                this.equip.armor_magic = equip.id;
                break;
            case E_itemT.hp_add:
                this.equip.hp_add = equip.id;
                break;
            case E_itemT.mp_add:
                this.equip.mp_add = equip.id;
                break;
            default:
                break;
        }
        this.recountBaseInfo(false);

    }

    /** 英雄升级了 */
    onLvUp(lv: number) {
        this.level = lv;
        this.recountBaseInfo(false);
    }

    /** 计算人物基础信息 */
    private recountBaseInfo(isInit: boolean) {
        let equip = this.equip;
        let cfgHeroLv = cfg_all().heroLv[this.heroId][this.level];

        // 血量
        let lastHpMax = this.hpMax;
        this.hpMax = cfgHeroLv.hp;
        if (equip.hp_add !== 0) {
            this.hpMax += cfg_all().item[equip.hp_add].num;
        }
        if (this.hp > this.hpMax) {
            this.hp = this.hpMax;
        }
        if (!isInit && this.hpMax !== lastHpMax) {
            this.map.sendMsgByAOI(this, cmd.onHpMaxChanged, { "id": this.id, "hpMax": this.hpMax, "hp": this.hp });
        }
        // 魔量
        let lastMpMax = this.mpMax;
        this.mpMax = cfgHeroLv.mp;
        if (equip.mp_add !== 0) {
            this.mpMax += cfg_all().item[equip.mp_add].num;
        }
        if (this.mp > this.mpMax) {
            this.mp = this.mpMax;
        }
        if (!isInit && this.mpMax !== lastMpMax) {
            this.getMsg(cmd.onMpMaxChanged, { "mpMax": this.mpMax, "mp": this.mp });
        }
        // 攻击力
        this.attack = cfgHeroLv.attack;
        if (equip.weapon !== 0) {
            this.attack += cfg_all().item[equip.weapon].num;
        }
        // 物抗
        this.armor_m = 1 - cfgHeroLv.armor_m / 100;
        if (equip.armor_magic !== 0) {
            this.armor_m -= cfg_all().item[equip.armor_magic].num / 100;
        }
        // 魔抗
        this.armor_p = 1 - cfgHeroLv.armor_p / 100;
        if (equip.armor_physical !== 0) {
            this.armor_p -= cfg_all().item[equip.armor_physical].num / 100;
        }
        console.log("人物信息", this.attack, this.armor_p, this.armor_m, this.hpMax, this.mpMax)
    }

    getMsg(cmd: cmd, msg: any) {
        app.sendMsgByUidSid(cmd, msg, [this]);
    }

    /** 快速加血加蓝 */
    useHpMpAdd(itemId: number) {
        let cfg = cfg_all().item[itemId];
        if (cfg.type === E_itemT.hp) {
            this.addHp(cfg.num);
            this.map.sendMsgByAOI(this, cmd.onUseHpFast, { "id": this.id, "num": cfg.num, "hp": this.hp });
        } else {
            this.addMp(cfg.num);
        }
    }

    die() {
        super.die(0);
        this.skillMgr.skillOver();
        this.buffMgr.buffOverAll();
    }

    copyStartMatch(doorId: number, next: Function) {
        if (this.copyMatchDoorId) {
            return next({ "code": 10040 });
        }
        let copyMatch = this.map.copyMatchDic[doorId];
        if (!copyMatch) {
            return;
        }
        copyMatch.startMatch(this);
        next({ "code": 0, "doorId": doorId });
    }

    copyCancelMatch(next: Function) {
        if (!this.copyMatchDoorId) {
            return next({ "code": 0 });
        }
        let copyMatch = this.map.copyMatchDic[this.copyMatchDoorId];
        copyMatch.cancelMatch(this);
        next({ "code": 0 });
    }

    pickItem(id: number) {
        let map = this.map;
        let item = map.getEntity<Item>(id);
        if (!item || item.t !== Entity_type.item) {
            return;
        }
        item.die();
        app.rpc(getInfoId(this.uid)).info.map.pickItem(this.uid, { "id": item.itemId, "num": item.num });
    }

    toJson(): I_playerJson {
        return {
            "id": this.id,
            "t": this.t,
            "x": Math.floor(this.x),
            "y": Math.floor(this.y),
            "uid": this.uid,
            "heroId": this.heroId,
            "nickname": this.nickname,
            "path": this.path,
            "hp": this.hp,
            "hpMax": this.hpMax,
        };
    }

    toJsonClick() {
        return {
            "id": this.id,
            "heroId": this.heroId,
            "level": this.level,
            "nickname": this.nickname,
            "equip": this.equip,
        }
    }

}


export interface I_playerJson {
    id: number;
    t: Entity_type;
    x: number;
    y: number;
    uid: number;
    heroId: number;
    nickname: string;
    path: I_xy[];
    hp: number;
    hpMax: number;
}

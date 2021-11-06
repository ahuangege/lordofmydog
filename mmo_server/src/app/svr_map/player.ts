import { app } from "mydog";
import { cmd } from "../../config/cmd";
import { I_playerMapJson, I_xy } from "../../servers/map/handler/main";
import { nowMs } from "../common/time";
import { I_item } from "../svr_info/bag";
import { I_equipment } from "../svr_info/equipment";
import { E_itemT } from "../svr_info/roleInfo";
import { Entity_type, I_entityJson } from "./entity";
import { Map } from "./map";
import { Role } from "./role";

/** 玩家 */
export class Player extends Role {
    uid: number;
    sid: string;
    heroId: number;     // 英雄id
    level: number;
    nickname: string;   // 昵称
    chatMapTime: number = 0;   // 上次场景聊天时刻
    equip: I_equipment;   // 装备
    skillPos: number[]; // 技能栏
    hpPos: I_item; // 快速加血栏
    mpPos: I_item; // 快速加蓝栏

    constructor(map: Map, info: I_playerMapJson) {
        super({ "map": map, "id": map.getId(), "t": Entity_type.player, "x": info.x, "y": info.y });
        this.map = map;
        this.uid = info.uid;
        this.sid = info.sid;
        this.heroId = info.heroId;
        this.level = info.level;
        this.nickname = info.nickname;
        this.equip = info.equip;
        this.skillPos = info.skillPos;
        this.hpPos = info.hpPos;
        this.mpPos = info.mpPos;
    }

    /** 进入地图 */
    enterMap() {
        let map = this.map;
        map.addEntity(this);
        map.addOrDelUidsid(this.uid, this.sid, true);

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
        let map = this.map;
        map.delEntity(this);
        map.addOrDelUidsid(this.uid, this.sid, false);

        // 移除监视，移除实体
        map.towerAOI.delWatcher(this, this);
        map.towerAOI.delObj(this, this);

        // 通知视野内其他玩家
        map.getEntityChangeMsg({ "delEntities": [this.id] }, map.towerAOI.getWatchers(this));
    }





    /** 移动 */
    move(msg: { "path": I_xy[] }) {

        // if (!this.uidsid.sid) {
        //     return;
        // }
        let map = this.map;
        if (msg.x <= 0 || msg.x >= map.width) {
            return;
        }
        // if (msg.x2 <= 0 || msg.x2 >= map.width) {
        //     return;
        // }
        if (msg.y <= 0 || msg.y >= map.height) {
            return;
        }
        // if (msg.y2 <= 0 || msg.y2 >= map.height) {
        //     return;
        // }

        let oldPos: { "x": number, "y": number } = { "x": this.x, "y": this.y };

        this.x = msg.x;
        this.y = msg.y;

        let group = map.towerAOI.getWatchers(oldPos);
        app.sendMsgByGroup(cmd.onMove, { "id": this.id, "x": this.x, "y": this.y }, group);

        map.towerAOI.updateWatcher(this, oldPos, this);
        map.towerAOI.updateObj(this, oldPos, this);
    }


    /** 视野范围聊天 */
    chatAOI(msg: { "msg": string }) {
        if (nowMs() - this.chatMapTime < 5 * 1000) {
            return;
        }
        this.chatMapTime = nowMs();
        let group = this.map.towerAOI.getWatchers(this);
        app.sendMsgByGroup(cmd.onChatAOI, { "id": this.id, "msg": msg.msg }, group);
    }

    /** 本场景聊天  */
    chatMap(msg: { "msg": string }) {
        if (nowMs() - this.chatMapTime < 5 * 1000) {
            return;
        }
        this.chatMapTime = nowMs();
        this.map.getMsg(cmd.onChatMap, { "nickname": this.nickname, "msg": msg.msg });
    }


    /** 修改昵称 */
    changeNickname(nickname: string) {
        this.nickname = nickname;
        let group = this.map.towerAOI.getWatchers(this);
        app.sendMsgByGroup(cmd.onNicknameChanged, { "id": this.id, "nickname": nickname }, group);

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


    }

    toJson(): I_playerJson {
        return {
            "id": this.id,
            "t": this.t,
            "x": this.x,
            "y": this.y,
            "uid": this.uid,
            "heroId": this.heroId,
            "nickname": this.nickname
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
}

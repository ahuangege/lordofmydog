import { app } from "mydog";
import { cmd } from "../../config/cmd";
import { I_playerMapJson } from "../../servers/map/handler/main";
import { nowMs } from "../common/time";
import { Entity_type, I_entityJson } from "./entity";
import { Map } from "./map";
import { Role } from "./role";

/** 玩家 */
export class Player extends Role {
    uid: number;
    sid: string;
    heroId: number;
    nickname: string;
    chatMapTime: number = 0;   // 上次场景聊天时刻
    constructor(map: Map, info: I_playerMapJson) {
        super({ "map": map, "id": map.getId(), "t": Entity_type.player, "x": info.x, "y": info.y });
        this.map = map;
        this.uid = info.uid;
        this.sid = info.sid;
        this.heroId = info.heroId;
        this.nickname = info.nickname;
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
    move(msg: { "x": number, "y": number }) {

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

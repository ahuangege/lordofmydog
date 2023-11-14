import { app, Application, Session } from "mydog";
import { cfg_all } from "../../../app/common/configUtil";
import { constKey } from "../../../app/common/someConfig";
import { nowSec } from "../../../app/common/time";
import { I_item } from "../../../app/svr_info/bag";
import { j2x2 } from "../../../app/svr_map/map";
import { MapIdMgr } from "../../../app/svr_map/mapIdMgr";
import { MapMgr } from "../../../app/svr_map/mapMgr";
import { Player } from "../../../app/svr_map/player";
import { I_useSkill } from "../../../app/svr_map/skill/skillMgr";
import { svr_map } from "../../../app/svr_map/svr_map";
import { getInfoId } from "../../../app/util/gameUtil";
import { getLen } from "../../../app/util/util";
import { cmd } from "../../../config/cmd";
import { Db_equipment } from "../../../app/db/dbModel/equipmentTable";

export default class Handler {
    private app: Application;
    private mapMgr: MapMgr;
    constructor(app: Application) {
        this.app = app;
        this.mapMgr = svr_map.mapMgr;
    }

    /** 客户端加载场景完了，请求进入地图 */
    async enterMap(msg: any, session: Session, next: Function) {
        const data = await app.rpc(getInfoId(session.uid)).info.map.enterMap(session.uid);
        if (!data) {
            next({ "code": 1 });
            return;
        }
        let map = this.mapMgr.getMap(session.get(constKey.mapIndex));
        if (!map) {
            return next({ "code": 1 });
        }
        if (!map.isPlayerHere(data.mapId, session.uid)) {
            return next({ "code": 1 });
        }
        let player = map.getPlayer(session.uid);
        if (player) {
            return next({ "code": 1 });
        }
        player = new Player(map, data);
        let jsonArr = player.enterMap();
        next({ "code": 0, "mapId": map.mapId, "meId": player.id, "mp": player.mp, "mpMax": player.mpMax, "skillCd": [0, 0, 0], "entities": jsonArr });
    }


    /** 移动 */
    move(msg: { "x": number, "y": number, "path": I_xy[] }, session: Session, next: Function) {
        let p = this.mapMgr.getPlayer(session.get(constKey.mapIndex), session.uid);
        if (p) {
            p.move(msg);
        }
    }



    /** 本场景聊天  */
    chatMap(msg: { "msg": string }, session: Session) {
        let p = this.mapMgr.getPlayer(session.get(constKey.mapIndex), session.uid);
        if (p) {
            p.chatMap(msg);
        }
    }

    /** 获取玩家信息 */
    getPlayerInfo(msg: { "id": number }, session: Session, next: Function) {
        let map = this.mapMgr.getMap(session.get(constKey.mapIndex));
        if (!map) {
            return;
        }
        let p = map.getEntity(msg.id) as Player;
        if (p) {
            next(p.toJsonClick());
        }
    }

    /** 释放技能 */
    useSkill(msg: I_useSkill, session: Session, next: Function) {
        let p = this.mapMgr.getPlayer(session.get(constKey.mapIndex), session.uid);
        if (p) {
            p.skillMgr.useSkill(msg);
        }
    }

    /** 点击传送门，切换地图 */
    async changeMap(msg: { "doorId": number }, session: Session, next: Function) {
        let p = this.mapMgr.getPlayer(session.get(constKey.mapIndex), session.uid);
        if (!p) {
            return;
        }
        let doorCfg = cfg_all().mapDoor[msg.doorId];
        if (!doorCfg) {
            return;
        }
        if (doorCfg.mapId !== p.map.mapId) {  // 没有这个出口
            return;
        }
        if (cfg_all().map[doorCfg.mapId2].isCopy) {   // 副本入口不行
            return;
        }
        if (getLen(p, { "x": j2x2(doorCfg.x), "y": j2x2(doorCfg.y) }) > 2 * 64) {    // 距离入口不够近
            return;
        }
        p.leaveMap();
        let mapSvr = MapIdMgr.getSvr(doorCfg.mapId2);
        await app.rpc(getInfoId(session.uid)).info.map.changeMap(session.uid, doorCfg.mapId2, doorCfg.mapId2, mapSvr, { "x": j2x2(doorCfg.x2), "y": j2x2(doorCfg.y2), });
        p.getMsg(cmd.onChangeMap, { "mapId": doorCfg.mapId2 });
    }


    /** 副本开始匹配 */
    copyStartMatch(msg: { "doorId": number }, session: Session, next: Function) {
        let p = this.mapMgr.getPlayer(session.get(constKey.mapIndex), session.uid);
        if (p) {
            p.copyStartMatch(msg.doorId, next);
        }
    }
    /** 副本取消匹配 */
    copyCancelMatch(msg: any, session: Session, next: Function) {
        let p = this.mapMgr.getPlayer(session.get(constKey.mapIndex), session.uid);
        if (p) {
            p.copyCancelMatch(next);
        }
    }

    /** 拾取地图上的道具 */
    pickItem(msg: { "id": number }, session: Session, next: Function) {
        let p = this.mapMgr.getPlayer(session.get(constKey.mapIndex), session.uid);
        if (p) {
            p.pickItem(msg.id);
        }
    }
}

export interface I_playerMapJson {
    uid: number,
    sid: string,
    heroId: number,
    level: number,
    mapId: number,
    mapIndex: number,
    nickname: string,
    x: number,
    y: number,
    equip: Db_equipment,   // 装备
    skillPos: number[], // 技能栏
    hp: number, // 血量
    mp: number, // 蓝量
}

export interface I_xy {
    x: number,
    y: number,
}
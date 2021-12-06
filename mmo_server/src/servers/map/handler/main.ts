import { app, Application, Session } from "mydog";
import { cfg_all } from "../../../app/common/configUtil";
import { constKey } from "../../../app/common/someConfig";
import { nowSec } from "../../../app/common/time";
import { I_item } from "../../../app/svr_info/bag";
import { I_equipment } from "../../../app/svr_info/equipment";
import { MapIdMgr } from "../../../app/svr_map/mapIdMgr";
import { MapMgr } from "../../../app/svr_map/mapMgr";
import { Player } from "../../../app/svr_map/player";
import { I_useSkill } from "../../../app/svr_map/skill/skillMgr";
import { svr_map } from "../../../app/svr_map/svr_map";
import { getInfoId } from "../../../app/util/gameUtil";
import { getLen } from "../../../app/util/util";
import { cmd } from "../../../config/cmd";

export default class Handler {
    private app: Application;
    private mapMgr: MapMgr;
    constructor(app: Application) {
        this.app = app;
        this.mapMgr = svr_map.mapMgr;
    }

    /** 客户端加载场景完了，请求进入地图 */
    enterMap(msg: any, session: Session, next: Function) {
        app.rpc(getInfoId(session.uid)).info.map.enterMap(session.uid, (err, data) => {
            if (err || !data) {
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
            next({ "code": 0, "mapId": map.mapId, "meId": player.id, "mp": player.mp, "mpMax": player.mpMax, "skillCd": [1, 1, 1], "entities": jsonArr });
        });
    }


    /** 移动 */
    move(msg: { "x": number, "y": number, "path": I_xy[] }, session: Session, next: Function) {
        let p = this.mapMgr.getPlayer(session.get(constKey.mapIndex), session.uid);
        if (p) {
            p.move(msg);
        }
    }



    /** 视野范围聊天 */
    chatAOI(msg: { "msg": string }, session: Session) {
        let p = this.mapMgr.getPlayer(session.get(constKey.mapIndex), session.uid);
        if (p) {
            p.chatAOI(msg);
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
    changeMap(msg: { "doorId": number }, session: Session, next: Function) {
        let p = this.mapMgr.getPlayer(session.get(constKey.mapIndex), session.uid);
        if (!p) {
            console.log("no p")
            return;
        }
        let doorCfg = cfg_all().mapDoor[msg.doorId];
        if (!doorCfg) {
            console.log(1111)
            return;
        }
        if (doorCfg.mapId !== p.map.mapId) {  // 没有这个出口
            console.log(222)
            return;
        }
        if (cfg_all().map[doorCfg.mapId2].isCopy) {   // 副本入口不行
            console.log("副本入口不行")
            return;
        }
        if (getLen(p, { "x": doorCfg.x * 64 + 32, "y": doorCfg.y * 64 + 32 }) > 2 * 64) {    // 距离入口不够近
            console.log("距离不够")
            return;
        }
        p.leaveMap();
        let mapSvr = MapIdMgr.getSvr(doorCfg.mapId2);
        app.rpc(getInfoId(session.uid)).info.map.changeMap(session.uid, doorCfg.mapId2, doorCfg.mapId2, mapSvr, { "x": doorCfg.x2 * 64 + 32, "y": doorCfg.y2 * 64 + 32, }, () => {
            p.getMsg(cmd.onChangeMap, { "mapId": doorCfg.mapId2 });
        });
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
    equip: I_equipment,   // 装备
    skillPos: number[], // 技能栏
    hp: number, // 血量
    mp: number, // 蓝量
}

export interface I_xy {
    x: number,
    y: number,
}
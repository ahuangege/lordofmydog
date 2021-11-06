import { app, Application, Session } from "mydog";
import { I_item } from "../../../app/svr_info/bag";
import { I_equipment } from "../../../app/svr_info/equipment";
import { MapMgr } from "../../../app/svr_map/mapMgr";
import { Player } from "../../../app/svr_map/player";
import { svr_map } from "../../../app/svr_map/svr_map";
import { getInfoId } from "../../../app/util/gameUtil";

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
            let map = this.mapMgr.getMap(session.get("mapIndex"));
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
            data.x = 300;
            data.y = 300;
            player = new Player(map, data);
            let jsonArr = player.enterMap();
            next({ "code": 0, "meId": player.id, "entities": jsonArr });
        });
    }


    /** 移动 */
    move(msg: { "path": I_xy[] }, session: Session, next: Function) {
        let p = this.mapMgr.getPlayer(session.get("mapIndex"), session.uid);
        if (p) {
            p.move(msg);
        }
    }



    /** 视野范围聊天 */
    chatAOI(msg: { "msg": string }, session: Session) {
        let p = this.mapMgr.getPlayer(session.get("mapIndex"), session.uid);
        if (p) {
            p.chatAOI(msg);
        }
    }

    /** 本场景聊天  */
    chatMap(msg: { "msg": string }, session: Session) {
        let p = this.mapMgr.getPlayer(session.get("mapIndex"), session.uid);
        if (p) {
            p.chatMap(msg);
        }
    }

    /** 获取玩家信息 */
    getPlayerInfo(msg: { "id": number }, session: Session, next: Function) {
        let map = this.mapMgr.getMap(session.get("mapIndex"));
        if (!map) {
            return;
        }
        let p = map.getEntity(msg.id) as Player;
        if (p) {
            next(p.toJsonClick());
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
    equip: I_equipment,   // 装备
    skillPos: number[], // 技能栏
    hpPos: I_item, // 快速加血栏
    mpPos: I_item, // 快速加蓝栏
}

export interface I_xy {
    x: number,
    y: number,
}
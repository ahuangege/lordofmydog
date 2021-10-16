import { app, Application, Session } from "mydog";
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
            player = new Player(map, data);
            let jsonArr = player.enterMap();
            next({ "code": 0, "meId": player.id, "entities": jsonArr });
        });
    }


    /** 移动 */
    move(msg: { "x": number, "y": number }, session: Session, next: Function) {
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

}

export interface I_playerMapJson {
    uid: number,
    sid: string,
    heroId: number,
    mapId: number,
    mapIndex: number,
    nickname: string,
    x: number,
    y: number,
}
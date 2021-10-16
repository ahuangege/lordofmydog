import { app, Session } from "mydog";
import { cfg_all } from "../../../app/common/configUtil";
import { RoleInfoMgr } from "../../../app/svr_info/roleInfoMgr";
import { svr_info } from "../../../app/svr_info/svr_info";
import { cmd } from "../../../config/cmd";


export default class Handler {
    private roleInfoMgr: RoleInfoMgr;

    constructor() {
        this.roleInfoMgr = svr_info.roleInfoMgr;
    }

    /** 切换地图 */
    changeMap(msg: { id: number }, session: Session, next: Function) {
        let role = this.roleInfoMgr.getRole(session.uid);
        if (!role) {
            return;
        }

        // let mapDoorCfg = cfg_all().mapDoor;
        // if (!mapDoorCfg[msg.id]) {
        //     return;
        // }
        // if (mapDoorCfg[msg.id].mapId !== role.role.mapId) {
        //     return;
        // }
        // let toMap = mapDoorCfg[mapDoorCfg[msg.id].toId];
        // app.rpc(getMapSvr(role.role.mapId)).map.main.leaveMap(role.role.mapId, session.uid, (err) => {
        //     if (err) {
        //         return;
        //     }
        //     role.changeRoleInfo({ "mapId": toMap.mapId, "x": toMap.x, "y": toMap.y });
        //     app.rpc(role.sid).connector.main.applySomeSession(session.uid, { "mapId": toMap.mapId });
        //     app.rpc(getMapSvr(role.role.mapId)).map.main.enterMap(toMap.mapId, role.toMapRoleJson());
        //     next({ "mapId": toMap.mapId });
        // });
    }

    /** 观察地图 */
    watchMap(msg: any, session: Session, next: Function) {
        let role = this.roleInfoMgr.getRole(session.uid);
        if (role) {
            // app.rpc(getMapSvr(role.role.mapId)).map.main.watchMap(role.role.mapId, session.uid, session.sid);
        }
    }

    /** 不再观察地图 */
    unwatchMap(msg: any, session: Session, next: Function) {
        let role = this.roleInfoMgr.getRole(session.uid);
        if (role) {
            // app.rpc(getMapSvr(role.role.mapId)).map.main.unwatchMap(role.role.mapId, session.uid);
        }
    }
}
import { app, rpcErr } from "mydog";
import { cfg_all } from "../../../app/common/configUtil";
import { constKey } from "../../../app/common/someConfig";
import { I_item } from "../../../app/svr_info/bag";
import { E_itemT } from "../../../app/svr_info/roleInfo";
import { svr_info } from "../../../app/svr_info/svr_info";
import { I_playerMapJson, I_xy } from "../../map/handler/main";

export default class MapRemote {


    enterMap(uid: number, cb: (err: number, data: I_playerMapJson) => void) {
        let role = svr_info.roleInfoMgr.getRole(uid);
        if (!role) {
            return cb(0, null as any);
        }
        cb(0, role.toMapJson());

    }

    /** 场景服定时同步玩家一些信息到info服 */
    syncSomeInfo(uid: number, pos: I_xy, hpmp: { "hp": number, "mp": number }) {
        console.log("syncSomeInfo", pos, hpmp)
        let role = svr_info.roleInfoMgr.getRole(uid);
        if (pos) {
            role.changeRoleInfo(pos);
        }
        if (hpmp) {
            role.changeRoleInfo(hpmp);
        }
    }

    /** 切换地图 */
    changeMap(uid: number, mapId: number, mapIndex: number, mapSvr: string, pos: I_xy, cb: () => void) {
        let role = svr_info.roleInfoMgr.getRole(uid);
        role.changeRoleMem({ "mapSvr": mapSvr, "mapIndex": mapIndex });
        role.changeRoleInfo({ "mapId": mapId });
        role.changeRoleInfo(pos);
        app.rpc(role.sid).connector.main.applySomeSession(uid, { [constKey.mapSvr]: mapSvr, [constKey.mapIndex]: mapIndex }, () => {
            cb();
        });
    }

    /** 拾取地图上的道具 */
    pickItem(uid: number, item: I_item) {
        let role = svr_info.roleInfoMgr.getRole(uid);
        role.bag.addItem(item);
    }

    /** 加经验值 */
    addExp(uid: number, num: number) {
        let role = svr_info.roleInfoMgr.getRole(uid);
        role.addExp(num);
    }

    /** 删除某装备 */
    delEquip(uid: number, t: E_itemT) {
        let role = svr_info.roleInfoMgr.getRole(uid);
        role.equip.delEquip(t);
    }
}

export interface I_syncSomeInfo {
    x?: number,
    y?: number,
    hp?: number,
    mp?: number,
}
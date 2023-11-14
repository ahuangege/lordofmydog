import { E_itemT } from "../../../app/svr_info/roleInfo";
import { MapMgr } from "../../../app/svr_map/mapMgr";
import { svr_map } from "../../../app/svr_map/svr_map";
import { randBetween } from "../../../app/util/util";


declare global {
    interface Rpc {
        map: {
            main: Remote
        }
    }
}

export default class Remote {
    private mapMgr: MapMgr;
    constructor() {
        this.mapMgr = svr_map.mapMgr;
    }

    /** 创建副本 */
    async createCopyMap(mapId: number, copyUids: number[]) {
        let mapIndex = this.mapMgr.createCopyMap(mapId, copyUids);
        return mapIndex
    }


    /** 离开地图 */
    async leaveMap(mapIndex: number, uid: number) {
        let player = this.mapMgr.getPlayer(mapIndex, uid);
        if (player) {
            player.leaveMap();
        }
    }


    async isMapOk(mapId: number, mapIndex: number, uid: number) {
        let map = this.mapMgr.getMap(mapIndex);
        if (!map) {
            return false;
        }
        return map.isPlayerHere(mapId, uid);
    }

    /** 装备变化了 */
    onEquipChanged(mapIndex: number, uid: number, equip: { "t": E_itemT, "id": number }) {
        let p = this.mapMgr.getPlayer(mapIndex, uid);
        p.onEquipChanged(equip);
    }

    /** 英雄升级了 */
    onHeroLvUp(mapIndex: number, uid: number, lv: number) {
        let p = this.mapMgr.getPlayer(mapIndex, uid);
        p.onLvUp(lv);
    }

    /** 使用快速加血加蓝 */
    useHpMpAdd(mapIndex: number, uid: number, itemId: number) {
        let p = this.mapMgr.getPlayer(mapIndex, uid);
        p.useHpMpAdd(itemId);
    }

    /** 切换技能了 */
    changeSkill(mapIndex: number, uid: number, addSkill: number, delSkill: number) {
        let p = this.mapMgr.getPlayer(mapIndex, uid);
        if (delSkill) {
            p.skillMgr.delSkill(delSkill);
        }
        if (addSkill) {
            p.skillMgr.addSkill(addSkill);
        }
    }

    /** 将装备扔地上 */
    dropItem(mapIndex: number, uid: number, itemId: number, num: number) {
        let map = this.mapMgr.getMap(mapIndex);
        if (!map) {
            return;
        }
        let p = map.getPlayer(uid);
        if (!p) {
            return;
        }
        let x = Math.floor(p.x);
        let y = Math.floor(p.y);
        x = map.limitX(randBetween(x - 80, x + 80));
        y = map.limitY(randBetween(y - 80, y + 80));
        map.createItem([{ "itemId": itemId, "num": num, "x": x, "y": y, "time": 20 }]);
    }
}
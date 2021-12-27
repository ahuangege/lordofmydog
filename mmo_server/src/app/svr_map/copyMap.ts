import { size } from "../util/util";
import { Map } from "./map";
import { Player } from "./player";
import { svr_map } from "./svr_map";


/** 副本地图 */
export class CopyMap extends Map {
    private copyUids: number[] = [];    // 副本时，本地图进来的玩家
    private tooLongTimeout: NodeJS.Timeout
    constructor(mapId: number, mapIndex: number, copyUids: number[]) {
        super(mapId, mapIndex, copyUids);
        this.isCopy = true;
        this.copyUids = copyUids;
        this.tooLongTimeout = setTimeout(this.onDestroy.bind(this), 60 * 1000);
    }


    isPlayerHere(mapId: number, uid: number) {
        if (this.mapId !== mapId) {
            return false;
        }
        if (!this.copyUids.includes(uid)) {
            return false;
        }
        return true;
    }

    playerIn(p: Player) {
        super.playerIn(p);
        if (this.tooLongTimeout) {
            clearTimeout(this.tooLongTimeout);
            this.tooLongTimeout = null as any;
        }
    }

    playerLeave(p: Player) {
        super.playerLeave(p);
        clearTimeout(this.tooLongTimeout);
        if (size(this.players) === 0) {
            this.onDestroy();
        }
    }

    onDestroy() {
        clearInterval(this.updateTimer);
        svr_map.mapMgr.delMap(this.mapIndex);
    }

}
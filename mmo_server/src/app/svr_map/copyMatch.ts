import { app } from "mydog";
import { cmd } from "../../config/cmd";
import { cfg_all, I_cfg_mapDoor } from "../common/configUtil";
import { gameLog } from "../common/logger";
import { nowSec } from "../common/time";
import { getInfoId } from "../util/gameUtil";
import { removeFromArr } from "../util/util";
import { j2x2, Map } from "./map";
import { MapIdMgr } from "./mapIdMgr";
import { Player } from "./player";

/** 副本匹配 */
export class CopyMatch {
    map: Map;
    private doorInfo: I_cfg_mapDoor;
    private players: Player[] = [];
    private needNum: number = 0;
    constructor(map: Map, doorId: number) {
        this.map = map;
        this.doorInfo = cfg_all().mapDoor[doorId];
        this.needNum = cfg_all().map[this.doorInfo.mapId2].copyNum;
        setInterval(this.matchLogic.bind(this), 3 * 1000);
    }

    /** 开始匹配 */
    startMatch(player: Player) {
        this.players.push(player);
        player.copyMatchDoorId = this.doorInfo.id;
        player.copyMatchTime = nowSec();
    }

    /** 取消匹配 */
    cancelMatch(player: Player) {
        removeFromArr(this.players, player);
        player.copyMatchDoorId = 0;
    }

    private matchLogic() {
        while (this.players.length >= this.needNum) {
            let arr = this.players.splice(0, this.needNum);
            this.matchOk(arr);
        }
        if (this.players.length > 0 && nowSec() - this.players[0].copyMatchTime > 6) {
            this.matchOk(this.players.splice(0));
        }
    }

    private async matchOk(arr: Player[]) {
        let uids: number[] = [];
        for (let one of arr) {
            one.leaveMap();
            uids.push(one.uid);
        }
        let mapSvr = MapIdMgr.getCopySvr();
        const mapIndex = await app.rpc(mapSvr).map.main.createCopyMap(this.doorInfo.mapId2, uids);

        let doorCfg = this.doorInfo;
        for (let one of arr) {
            await app.rpc(getInfoId(one.uid)).info.map.changeMap(one.uid, doorCfg.mapId2, mapIndex, mapSvr, { "x": j2x2(doorCfg.x2), "y": j2x2(doorCfg.y2), });
            one.getMsg(cmd.onCopyMatchOk, { "doorId": doorCfg.id });
        }
    }
}
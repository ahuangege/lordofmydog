import { app } from "mydog";
import { Dic } from "../util/util";
import { CopyMap } from "./copyMap";
import { Map } from "./map";
import { Player } from "./player";


export class MapMgr {
    private mapDic: Dic<Map> = {};
    private copyIndex = 1000;   // 从1000开始，假定非副本类的地图少于1000张
    constructor() {
        process.nextTick(() => {
            let mapIds: number[] = app.serverInfo["mapIds"];
            for (let id of mapIds) {
                this.mapDic[id] = new Map(id, id, []);
            }
        });
    }

    /** 创建副本 */
    createCopyMap(mapId: number, copyUids: number[]) {
        let mapIndex = this.copyIndex++;
        console.log("创建副本", mapIndex);
        this.mapDic[mapIndex] = new CopyMap(mapId, mapIndex, copyUids);
        return mapIndex;
    }

    getMap(mapIndex: number) {
        return this.mapDic[mapIndex];
    }

    delMap(mapIndex: number) {
        console.log("删除副本", mapIndex);
        delete this.mapDic[mapIndex];
    }

    getPlayer(mapIndex: number, uid: number): Player {
        let map = this.getMap(mapIndex);
        if (!map) {
            return null as any;
        }
        return map.getPlayer(uid);
    }


}
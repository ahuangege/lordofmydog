import { app } from "mydog";
import { Dic } from "../util/util";
import { Map } from "./map";
import { Player } from "./player";


export class MapMgr {
    private mapDic: Dic<Map> = {};

    constructor() {
        let mapIds: number[] = app.serverInfo["mapIds"];
        for (let id of mapIds) {
            this.mapDic[id] = new Map(id, id);
        }
    }

    getMap(mapIndex: number) {
        return this.mapDic[mapIndex];
    }

    getPlayer(mapIndex: number, uid: number): Player {
        let map = this.getMap(mapIndex);
        if (!map) {
            return null as any;
        }
        return map.getPlayer(uid);
    }


}
import { getMapTileJson } from "../common/configUtil";
import { Dic } from "../util/util";
import { Pathfind } from "./pathFind";

/** 寻路管理（目的：副本是两三人那样的地图，可能会有大量的拷贝，可以共用一个寻路组件，减少内存占用） */
export class PathFindMgr {
    private pathFindDic: Dic<Pathfind> = {};
    private mapNumDic: Dic<number> = {};

    add(mapId: number) {
        this.mapNumDic[mapId] = (this.mapNumDic[mapId] || 0) + 1;
        if (!this.pathFindDic[mapId]) {
            let pathFind = new Pathfind();
            pathFind.init(getMapTileJson(mapId), { "maxSearch": 50 })
            this.pathFindDic[mapId] = pathFind;
        }
    }

    del(mapId: number) {
        this.mapNumDic[mapId] -= 1;
        if (!this.mapNumDic[mapId]) {
            delete this.pathFindDic[mapId];
        }
    }

    get(mapId: number) {
        return this.pathFindDic[mapId];
    }
}
import { app } from "mydog";
import { serverType } from "../common/someConfig";
import { Dic, randArrElement } from "../util/util";


export class MapIdMgr {
    private static needInit = true;
    private static mapIdDic: Dic<string> = {};
    private static copySvrArr: string[] = [];

    private static init() {
        let mapSvrs = app.serversConfig[serverType.map];
        for (let one of mapSvrs) {
            let mapIds = one["mapIds"];
            for (let id of mapIds) {
                this.mapIdDic[id] = one.id;
            }
            if (one["loadCopy"]) {
                this.copySvrArr.push(one.id);
            }
        }
        this.needInit = false;
    }

    static getSvr(mapId: number) {
        if (this.needInit) {
            this.init();
        }
        return this.mapIdDic[mapId];
    }

    static getCopySvr() {
        if (this.needInit) {
            this.init();
        }
        return randArrElement(this.copySvrArr);
    }

}
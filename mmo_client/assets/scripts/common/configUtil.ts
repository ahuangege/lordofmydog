
let hasLoaded = false;


interface Dic<T = any> {
    [id: string]: T
}

interface I_cfgAll {
    "errcode": Dic<I_cfg_errcode>,
}


let cfgAll: I_cfgAll = {} as any;
export let cfg_all = () => cfgAll;
let mapJsonDic: Dic<number[][]> = {};
export function getMapJson(mapId: number) {
    return mapJsonDic["map" + mapId];
}

export function initConfig(cb: () => void) {
    if (hasLoaded) {
        cb();
        return;
    }
    hasLoaded = true;
    cc.resources.loadDir("jsonData", cc.JsonAsset, (err, res: cc.JsonAsset[]) => {
        if (err) {
            console.error(err);
            return;
        }
        for (let one of res) {
            cfgAll[one.name] = one.json;
        }
        cc.resources.loadDir("mapJson", cc.JsonAsset, (err, res2: cc.JsonAsset[]) => {
            if (err) {
                console.error(err);
                return;
            }
            for (let one of res2) {
                mapJsonDic[one.name] = one.json;
            }
            cb();
        });
    });
}


interface I_cfg_errcode {
    des: string
}

let hasLoaded = false;


interface Dic<T = any> {
    [id: string]: T
}

interface I_cfgAll {
    "errcode": Dic<I_cfg_errcode>,
    "item": Dic<I_cfg_item>,
    "hero": Dic<I_cfg_hero>,
    "heroLv": Dic<Dic<I_cfg_heroLv>>,
    "skill": Dic<I_cfg_skill>,
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
        changeHeroLv();
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


function changeHeroLv() {
    let data = cfg_all().heroLv as any;
    let endData: Dic<Dic<I_cfg_heroLv>> = {};
    for (let x in data) {
        let one = data[x];
        let heroOne = endData[one.heroId];
        if (!heroOne) {
            heroOne = {};
            endData[one.heroId] = heroOne;
        }
        heroOne[one.lv] = one;
    }
    cfgAll.heroLv = endData;
}

/** 错误码 */
interface I_cfg_errcode {
    des: string
}
/** 道具 */
interface I_cfg_item {
    id: number,
    name: string,
    des: string,
    type: number,
    num: number,
}

/** 英雄 */
interface I_cfg_hero {
    id: number,
    initSkill: number,
    skill: number[],
    skillUnlockLv: number[],
}
/** 英雄升级数据 */
interface I_cfg_heroLv {
    "lv": number,
    "exp": number,
    "attack": number,
    "hp": number,
    "mp": number,
    "armor_p": number,
    "armor_m": number
}
/** 技能 */
interface I_cfg_skill {
    id: number,
    name: number,
    des: number,
    cd: number,
}

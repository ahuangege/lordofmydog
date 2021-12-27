import { E_skillTargetType } from "../map/skill/skillPre";

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
    "map": Dic<I_cfg_map>,
    "mapDoor": Dic<I_cfg_mapDoor>,
    "shop": Dic<I_cfg_shop>,
    "shopItem": Dic<I_cfg_shopItem>,
    "monster": Dic<I_cfg_monster>,
}


let cfgAll: I_cfgAll = {} as any;
export let cfg_all = () => cfgAll;
let mapJsonDic: Dic<number[][]> = {};
export function getMapJson(mapId: number, cb: (data: number[][]) => void) {
    let jsonName = "map" + mapId;
    if (mapJsonDic[jsonName]) {
        return cb(mapJsonDic[jsonName]);
    }
    cc.resources.load("mapJson/map" + mapId, cc.JsonAsset, (err, res: cc.JsonAsset) => {
        if (err) {
            console.error(err);
            return cb(null);
        }
        mapJsonDic[jsonName] = res.json;
        cb(res.json);
    });
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
        cb();
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
    name: string,
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
    damage: number,
    targetType: E_skillTargetType,
    targetDistance: number,
    mpCost: number,
    range: number,
}

/** 地图信息 */
interface I_cfg_map {
    id: number,
    name: string,
    isCopy: number,
    copyNum: number,
}

/** 地图出口信息 */
export interface I_cfg_mapDoor {
    id: number,
    mapId: number,  // 地图id
    mapId2: number, // 目标地图id
    x: number,
    y: number,
    x2: number,
    y2: number,
}

/** 商店 */
export interface I_cfg_shop {
    id: number, // 商店id
    name: string,
    mapId: number,  // 所在地图
    x: number,     // x
    y: number,  // y
}

/** 商店卖的物品 */
export interface I_cfg_shopItem {
    id: number,
    shopId: number,
    itemId: number,
    gold: number,
}


/** 怪物数据 */
export interface I_cfg_monster {
    id: number,
    name: string,
    skill: number[],
    hp: number,
    mp: number,
    attack: number,
    armor_p: number,
    armor_m: number,
    items: number[][],
    exp: number,
    range: number,
}

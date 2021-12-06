import { cfg_all } from "../common/configUtil";


export function getItemImg(id: number, cb: (img: cc.SpriteFrame) => void) {
    cc.resources.load("itemImg/" + id, cc.SpriteFrame, (err, img: cc.SpriteFrame) => {
        if (err) {
            cb(null);
        } else {
            cb(img);
        }
    });
}
export function getSkillImg(id: number, cb: (img: cc.SpriteFrame) => void) {
    cc.resources.load("skillImg/" + id, cc.SpriteFrame, (err, img: cc.SpriteFrame) => {
        if (err) {
            cb(null);
        } else {
            cb(img);
        }
    });
}

export enum E_itemT {
    gold = 0,               // 金币
    weapon = 1,             // 武器栏
    armor_physical = 2,    // 物抗栏
    armor_magic = 3,        // 魔抗栏
    hp_add = 4,     // 加血上限栏
    mp_add = 5,     // 加魔上限栏
    hp = 6,         // 快速加血栏
    mp = 7,         // 快速加蓝栏
}

let hintDic = {
    [E_itemT.weapon]: "攻击力：",
    [E_itemT.armor_physical]: "物抗：",
    [E_itemT.armor_magic]: "魔抗：",
    [E_itemT.hp_add]: "血量：",
    [E_itemT.mp_add]: "魔量：",
    [E_itemT.hp]: "快速回血：",
    [E_itemT.mp]: "快速回蓝：",
}

export function getItemHintInfo(id: number) {
    let cfg = cfg_all().item[id];
    let info = "<b>" + cfg.name + "</b>\n\n" + cfg.des + "\n\n<color=#DA4217>" + hintDic[cfg.type] + cfg.num + "</color>";
    return info;
}

export function getSkillHintInfo(id: number) {
    let cfg = cfg_all().skill[id];
    let info = "<b>" + cfg.name + "</b>\n\n" + cfg.des + "";
    return info;
}

/** 一些事件 */
export enum GameEvent {
    /** 背包道具拖拽放下 */
    onBagItemDrop = "onBagItemDrop",
    /** 技能拖拽放下 */
    onSkillDrop = "onSkillDrop",
}

export function removeFromArr<T>(arr: T[], one: T) {
    let index = arr.indexOf(one);
    if (index !== -1) {
        arr.splice(index, 1);
    }
}

/**
 * 随机获取数组下标
 */
 export function randIntNum(num: number) {
    return Math.floor(Math.random() * num);
}

export function randBetween(min: number, max: number) {
    return min + randIntNum(max - min + 1);
}
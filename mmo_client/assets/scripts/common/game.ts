import { I_loginBack } from "../login/loginPanel";

export class Game {

    static uid: number = 0;
    static loginInfo: I_loginBack = null as any;
    static roleInfo: I_roleInfo = null as any;


    static getItemByI(index: number) {
        let bag = this.roleInfo.bag;
        for (let one of bag) {
            if (one.i === index) {
                return one;
            }
        }
        return null;
    }

}


export interface I_roleInfo {
    "uid": number,              // uid
    "accId": number,            // 账号id
    "nickname": string,         // 昵称
    "gold": number,             // 金币
    "heroId": number,           // 英雄id
    "level": number,            // 等级
    "exp": number,              // 经验值
    "mapId": number,            // 当前地图
    "bag": I_bagItem[],         // 背包
    "equip": I_equipment,       // 装备
    "hpPos": I_Item,
    "mpPos": I_Item,
}

export interface I_bagItem {
    i: number,
    id: number,
    num: number,
}

export interface I_Item {
    id: number,
    num: number,
}

export interface I_equipment {
    "weapon": number,           // 武器
    "armor_physical": number,   // 物理护甲
    "armor_magic": number,      // 魔法抗性
    "hp": number,               // 加血量上限
    "mp": number,               // 加蓝量上限
}

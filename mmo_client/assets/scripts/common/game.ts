import { I_loginBack } from "../login/loginPanel";
import { Dic } from "../map/mapMain";

export class Game {

    static uid: number = 0;
    static loginInfo: I_loginBack = null as any;
    static roleInfo: I_roleInfo = null as any;
    static mapId: number = 0;

    static keySet: Dic<string> = null as any;    // 快捷键设置

    static getItemByI(index: number) {
        let bag = this.roleInfo.bag;
        for (let one of bag) {
            if (one.i === index) {
                return one;
            }
        }
        return null;
    }

    static localStorage_getItem(key: string | any[]) {
        if (typeof key !== "string") {
            key = key.join("_");
        }
        return cc.sys.localStorage.getItem(key);
    }

    static localStorage_setItem(key: string | any[], value: string) {
        if (typeof key !== "string") {
            key = key.join("_");
        }
        cc.sys.localStorage.setItem(key, value);
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
    "learnedSkill": number[],   // 已学习的技能
    "skillPos": number[],         // 使用中的技能栏
    "hpPos": I_Item,     // 快速加血栏
    "mpPos": I_Item,     // 快速加蓝栏
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
    "hp_add": number,               // 加血量上限
    "mp_add": number,               // 加蓝量上限
}

export enum E_localStorageType {
    panelPos = "panelPos",  // 游戏中界面位置
    keySet = "keySet",  // 快捷键设置
}
import { Db_bag, I_bagItem } from "../db/dbModel/bagTable";
import { Db_equipment } from "../db/dbModel/equipmentTable";
import { Db_role } from "../db/dbModel/roleTable";
import { I_item } from "../svr_info/bag";

/**
 * 玩家内存里的部分信息（非数据库字段）
 */
export interface I_roleMem {
    "mapSvr": string,          // svr
    "mapIndex": number,        // 场景序号（主图序号即地图id，副本序号则是从1000开始的）
    "token": number,           // token
}



/**
 * 玩家基本数据
 */
export interface I_roleAllInfo {
    "code": number,
    "role": Db_role,
    "bag": Db_bag,
    "equipment": Db_equipment,
}

/**
 * 玩家登录返回的基本数据
 */
export interface I_roleAllInfoClient {
    "code": number,
    "role": I_roleInfoClient,
}

interface I_roleInfoClient {
    "uid": number,              // uid
    "accId": number,            // 账号id
    "nickname": string,         // 昵称
    "gold": number,             // 金币
    "heroId": number,           // 英雄id
    "level": number,            // 等级
    "exp": number,              // 经验值
    "mapId": number,            // 当前地图
    "mapSvr": string,
    "mapIndex": number,
    "bag": I_bagItem[],         // 背包
    "equip": Db_equipment,       // 装备
    "learnedSkill": number[],   // 已学习技能
    "skillPos": number[],   // 使用中的技能栏
    "hpPos": I_item,    // 快速加血栏
    "mpPos": I_item,    // 快速加蓝栏
}


export interface I_uidsid {
    uid: number,
    sid: string,
}
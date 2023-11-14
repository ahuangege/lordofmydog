import { I_item } from "../../svr_info/bag";

/** 角色 */
export class Db_role {
    /** 角色id */
    uid = 0;

    /** 账号id */
    accId = 0;

    /** 昵称 */
    nickname = "";

    /** 金币 */
    gold = 1000;

    /** 职业id */
    heroId = 0;

    /** 等级 */
    level = 1;

    /** 经验值 */
    exp = 0;

    /** 地图id */
    mapId = 1;

    /** 地图坐标x */
    x = 0;

    /** 地图坐标y */
    y = 0;

    /** 血量 */
    hp = 10;

    /** 蓝量 */
    mp = 10;

    /** 已学习技能 */
    learnedSkill: number[] = [];

    /** 使用中的技能栏 */
    skillPos: number[] = [];

    /** 快速加血栏 */
    hpPos: I_item = { "id": 0, "num": 0 };

    /** 快速加蓝栏 */
    mpPos: I_item = { "id": 0, "num": 0 };

    /** 角色是否被删除  0未 */
    isDelete = 0;

    constructor() { }
}

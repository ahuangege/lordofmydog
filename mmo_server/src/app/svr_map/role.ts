
import { Entity, I_EntityInit } from "./entity";
import { Map } from "./map";

/** 角色（如玩家、怪物） */
export abstract class Role extends Entity {
    hpMax = 0;  // 最大血量
    mpMax = 0;  // 最大蓝量
    hp = 0;     // 当前血量
    mp = 0;     // 当前蓝量
    attack = 0;     // 攻击力
    armor_p = 0;    // 物防
    armor_m = 0;    // 魔防

    constructor(info: I_EntityInit) {
        super(info);
    }


}


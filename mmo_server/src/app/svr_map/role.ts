
import { Entity, I_EntityInit } from "./entity";
import { Map } from "./map";

/** 角色（如玩家、怪物） */
export abstract class Role extends Entity {

    constructor(info: I_EntityInit) {
        super(info);
    }


}


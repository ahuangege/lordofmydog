import { I_itemJson } from "./item";
import { Map } from "./map";
import { I_monsterJson } from "./monster";
import { I_playerJson } from "./player";

/** 场景实体 */
export abstract class Entity {
    map: Map;
    id: number;
    t: Entity_type;
    x: number;
    y: number;
    tx: number = 0;
    ty: number = 0;
    constructor(opts: I_EntityInit) {
        this.map = opts.map;
        this.id = opts.id;
        this.t = opts.t;
        this.x = opts.x;
        this.y = opts.y;
    }

    update(dt: number) {

    }

    toJson(): I_entityJson {
        return null as any;
    }
}

export const enum Entity_type {
    player,
    monster,
    item,
}

export interface I_EntityInit {
    "map": Map, "id": number, "t": Entity_type, "x": number, "y": number
}

export type I_entityJson = I_playerJson | I_monsterJson | I_itemJson;


export const playerRange = 1;
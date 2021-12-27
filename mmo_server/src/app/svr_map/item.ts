import { Entity, Entity_type, I_EntityInit } from "./entity";

/** 地上掉落的物品 */
export class Item extends Entity {
    itemId: number;
    num: number;
    time: number;
    constructor(itemId: number, num: number, time: number, info: I_EntityInit) {
        super(info);
        this.itemId = itemId;
        this.num = num;
        this.time = time;
    }

    update(dt: number) {
        this.time -= dt;
        if (this.time <= 0) {
            this.die();
        }
    }

    die() {
        this.map.delEntity(this);
        this.map.towerAOI.delObj(this, this);
        this.map.getEntityChangeMsg({ "delEntities": [this.id] }, this.map.towerAOI.getWatchers(this));
    }

    toJson(): I_itemJson {
        return {
            "id": this.id,
            "t": this.t,
            "x": this.x,
            "y": this.y,
            "itemId": this.itemId,
            "num": this.num,
        };
    }
}


export interface I_itemJson {
    id: number;
    t: Entity_type;
    x: number;
    y: number;
    itemId: number;
    num: number;
}

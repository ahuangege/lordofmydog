import { Entity, Entity_type } from "./entity";

const { ccclass, property } = cc._decorator;

@ccclass
export class Player extends Entity {
    uid: number;
    heroId: number;
    nickname: string;

    init(json: I_playerJson) {
        this.id = json.id;
        this.t = json.t;
        this.uid = json.id;
        this.heroId = json.heroId;
        this.nickname = json.nickname;
        this.node.getChildByName("name").getComponent(cc.Label).string = this.nickname;
    }
}

export interface I_playerJson {
    id: number;
    t: Entity_type;
    x: number;
    y: number;
    uid: number;
    heroId: number;
    nickname: string;
}
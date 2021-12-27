// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { I_monsterJson } from "./monster";
import { I_itemJson } from "./other/mapItemPrefab";
import { I_playerJson } from "./player";


const { ccclass, property } = cc._decorator;

@ccclass
export class Entity extends cc.Component {
    id: number;
    t: Entity_type;

}

export const enum Entity_type {
    player,
    monster,
    item,
}
export type I_entityJson = I_playerJson | I_itemJson | I_monsterJson

